#include <SPI.h>
#include <Ethernet2.h>
#include <EthernetUdp2.h>
#include <Time.h>
#include <TimeLib.h>


// bit set / clear
#ifndef cbi
#define cbi(PORT, BIT) (_SFR_BYTE(PORT) &= ~_BV(BIT))
#endif
#ifndef sbi
#define sbi(PORT, BIT) (_SFR_BYTE(PORT) |= _BV(BIT))
#endif

// byte timeServer[] = { 133 ,243, 238, 164 }; // ntp.nict.jp NTP server
char timeServer[] = "time.nist.gov";
// IPAddress timeServer(133, 243, 238, 164);

unsigned int localPort = 8888;
const int NTP_PACKET_SIZE= 48;
byte packetBuffer[NTP_PACKET_SIZE];
byte timecode[60];
unsigned long lastNTPTime = 0;

EthernetUDP Udp;


void setup() {
  Serial.begin(9600);
   while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }

  // Ethernet settings
  byte mac[] = { 0x90, 0xA2, 0xDA, 0x10, 0x61, 0xD5 };
  byte ip[] = { 192, 168, 0, 10 };
  byte gateway[] = { 192, 168, 0, 1 };
  byte subnet[] = { 255,255,255,0 };

  pinMode(3, OUTPUT);

  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    // no point in carrying on, so do nothing forevermore:
    for (;;)
      ;
  }
  Udp.begin(localPort);

  NTPSetTime();
  setupTimeCode();
}

void loop() {
  int wait_start = second();
  while (wait_start == second()); // wait until time is corrected
  unsigned long startTime = millis();

  // generate 40khz from 3 pin using PWM
  digitalWrite(3, LOW);

  TCCR2A = _BV(WGM20);
  TCCR2B = _BV(WGM22) | _BV(CS20);
  OCR2A = F_CPU / 2 / 40000; // hz
  OCR2B = OCR2A / 2; // 50% duty
  sbi(TCCR2A, COM2B1);

  // print out current time
  Serial.print(year());
  Serial.print('/');
  Serial.print(month());
  Serial.print('/');
  Serial.print(day());
  Serial.print(' ');
  Serial.print(hour());
  Serial.print(':');
  Serial.print(minute());
  Serial.print(':');
  Serial.print(second());
  Serial.print('(');
  Serial.print(weekday());
  Serial.print(')');
  Serial.println(dayOfYear());

  // calc signal duration (ms)
  int ms = calcTimeCodeDuration();

  // wait ms and stop PWM
  while (millis() - startTime < ms);
  cbi(TCCR2A,COM2B1);

  if (millis() - lastNTPTime > 10 * 10 * 1000L) {
    NTPSetTime();
    lastNTPTime = millis();
  }
}



/**
 * NTPSetTime
 */
void NTPSetTime() {
  // while (Udp.parsePacket() > 0);
  sendNTPpacket(timeServer);
  Serial.println("Waiting NTP response ...");

  // wait to see if a reply is available
  delay(1000);
  if ( Udp.parsePacket() ) {
    // We've received a packet, read the data from it
    Udp.read(packetBuffer, NTP_PACKET_SIZE); // read the packet into the buffer

    // the timestamp starts at byte 40 of the received packet and is four bytes,
    // or two words, long. First, esxtract the two words:

    unsigned long highWord = word(packetBuffer[40], packetBuffer[41]);
    unsigned long lowWord = word(packetBuffer[42], packetBuffer[43]);
    // combine the four bytes (two words) into a long integer
    // this is NTP time (seconds since Jan 1 1900):
    unsigned long secsSince1900 = highWord << 16 | lowWord;
    Serial.print("Seconds since Jan 1 1900 = " );
    Serial.println(secsSince1900);

    unsigned int fraction_hi = word(packetBuffer[44], packetBuffer[45]);

    // now convert NTP time into everyday time:
    Serial.print("Unix time = ");
    // Unix time starts on Jan 1 1970. In seconds, that's 2208988800:
    const unsigned long seventyYears = 2208988800UL;
    // subtract seventy years:
    unsigned long epoch = secsSince1900 - seventyYears;
    // print Unix time:
    Serial.println(epoch);

    // wait until next sencod
    delay(900 - fraction_hi / (65536 / 1000));

    // Set current time in JST (GMT+0900)
    setTime(epoch + 1 + 9 * 60 * 60);

    // print Unix time:
    Serial.print("localtime = ");
    Serial.println(epoch);
  }
//  delay(10000);
}


/**
 * sendNTPpacket
 */
unsigned long sendNTPpacket(char* address) {
   // set all bytes in the buffer to 0
  memset(packetBuffer, 0, NTP_PACKET_SIZE);

  // Initialize values needed to form NTP request
  // (see URL above for details on the packets)
  packetBuffer[0] = 0b11100011;   // LI, Version, Mode
  packetBuffer[1] = 0;     // Stratum, or type of clock
  packetBuffer[2] = 6;     // Polling Interval
  packetBuffer[3] = 0xEC;  // Peer Clock Precision

  // 8 bytes of zero for Root Delay & Root Dispersion
  packetBuffer[12]  = 49;
  packetBuffer[13]  = 0x4E;
  packetBuffer[14]  = 49;
  packetBuffer[15]  = 52;

  // all NTP fields have been given values, now
  // you can send a packet requesting a timestamp:
  Udp.beginPacket(address, 123); //NTP requests are to port 123
  Udp.write(packetBuffer, NTP_PACKET_SIZE);
  Udp.endPacket();
}


/**
 * calcTimeCodeDuration
 */
unsigned int calcTimeCodeDuration() {
  int s = second();
  if (s == 0) setupTimeCode();
  return timecode[s] * 100;
}

/**
 * setupTimeCode
 */
void setupTimeCode() {
  int i;
  memset(timecode, 8, sizeof(timecode));

  setupTimeCode100(minute(), 0);
  timecode[0] = 2;

  setupTimeCode100(hour(), 10);

  int d = dayOfYear();
  setupTimeCode100(d / 10, 20);
  setupTimeCode100(d % 10 * 10, 30);

  int parity1 = 0, parity2 = 0;
  for (i = 12; i < 20; i++) parity1 ^= timecode[i] == 5;
  for (i =  1; i < 10; i++) parity2 ^= timecode[i] == 5;
  timecode[36] = parity1 ? 5 : 8;
  timecode[37] = parity2 ? 5 : 8;

  setupTimeCode100(year() % 100, 40);
  for (i = 44; i > 40; i--) {
    timecode[i] = timecode[i-1];
  }
  timecode[40] = 8;

  int w = weekday() - 1;
  timecode[50] = (w & 4) ? 5 : 8;
  timecode[51] = (w & 2) ? 5 : 8;
  timecode[52] = (w & 1) ? 5 : 8;
  timecode[59] = 2;

  /* dump */
  for (i = 0; i < 60; i++) {
    Serial.print(timecode[i], DEC);
    Serial.print(i % 10 == 9 ? "\r\n" : " ");
  }
}


/**
 * setupTimeCode100
 */
void setupTimeCode100(int m, int i) {
  timecode[i+0] = ((m/10) & 8) ? 5 : 8;
  timecode[i+1] = ((m/10) & 4) ? 5 : 8;
  timecode[i+2] = ((m/10) & 2) ? 5 : 8;
  timecode[i+3] = ((m/10) & 1) ? 5 : 8;
  timecode[i+4] = 8;
  timecode[i+5] = ((m%10) & 8) ? 5 : 8;
  timecode[i+6] = ((m%10) & 4) ? 5 : 8;
  timecode[i+7] = ((m%10) & 2) ? 5 : 8;
  timecode[i+8] = ((m%10) & 1) ? 5 : 8;
  timecode[i+9] = 2;
}


/**
 * dayOfYear
 */
int dayOfYear() {
  uint8_t test = atoi(String(CalendarYrToTm(year())).c_str());
  tmElements_t tm = { 0, 0, 0, 0, 1, 1, test };
  time_t t = makeTime(tm);
  return (now() - t) / SECS_PER_DAY + 1;
}
