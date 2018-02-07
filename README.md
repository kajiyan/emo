# emo
<br><br><br>



## Experiments

- [Emotion API](https://kajiyan.github.io/emo/experiments)
<br><br><br>



## Flow
  1. ネット上で発生する感情
  2. デジタル信号に変換
  3. 物理現象として再現、置き換え
  4. 画像処理や、映像として読み込み再度デジタル信号に変換
  5. 言葉、画像、映像などにして、ネットにもどす
  6. 1にもどる
<br><br><br>



## ネット上で発生する感情
### 入力ソース
1. [画像ベース](#phase-0-src-0)
2. [テキストベース](#phase-0-src-1)

公開されているAPI 以外でも、ネット上にあるデータならスクレイピング（収集）することができます。  
<br><br><br>


<a name="phase-0-src-0"></a>
#### 1. 入力ソース - 画像ベース
1-1. [Bing Image Search API](#bing-image-search-api)  
<br><br>

<a name="#bing-image-search-api"></a>
##### 1-1. Bing Image Search API
Web 上の画像収集。<br>
🔗 [Bing Image Search API](https://azure.microsoft.com/ja-jp/services/cognitive-services/bing-image-search-api/)


<br><hr><br>


<a name="phase-0-src-1"></a>
#### 2. 入力ソース - テキストベース
2-1. [Bing News Search API](#bing-news-search-api)  
2-2. [Twitter API](#twitter-api)  
<br><br>

<a name="#bing-news-search-api"></a>
##### 2-1. Bing News Search API
Web 上のニュース記事を検索できる。検索結果にはニュース記事と関連性の高い画像、関連するニュースとカテゴリ、提供元の情報、記事の URL、追加された日付などの詳細情報が含まれる。<br>
🔗 [Bing News Search API](https://azure.microsoft.com/ja-jp/services/cognitive-services/bing-news-search-api/)
<br><br>

<a name="#twitter-api"></a>
##### 2-2. Twitter API
Twitter上からテキストを取得する。<br>
ストリーム系のAPIでは全ての公開ツイートからランダムに選んだ少数のサンプルを取得したり、ひとつ以上のキーワードに合致したツイートを取得できる。（ストリーム系のAPIは英語ツイート限定？）。<br>
🔗 [Docs — Twitter Developers](https://developer.twitter.com/en/docs)<br>
🔗 [Twitter 開発者 ドキュメント日本語訳](http://westplain.sakuraweb.com/translate/twitter/Documentation/REST-APIs/Public-API/REST-APIs.cgi)


<br><br><br><hr><br><br><br>



## デジタル信号に変換
### 解析方法
1. [画像ベース](#phase-1-src-0)
2. [テキストベース](#phase-1-src-1)
<br><br><br>


<a name="phase-1-src-0"></a>
#### 1. 解析方法 画像ベース
1-1. [Computer Vision API](#computer-vision-api)  
1-2. [Emotion API](#emotion-api)
<br><br>


<a name="computer-vision-api"></a>
#### 1-1. Computer Vision API
静止画像のコンテンツ・デスクリプション・タグ生成。成人向けコンテンツ判定 。有名人顔判定。ビデオのタグ生成（リアルタイム）。画像の文字抽出（OCR）。サムネイル生成。
画像の種類や写真内の配色を特定。<br>
**1日に5,000トランザクション、1分あたり20回までリクエスト**できる。<br>
🔗 [Computer Vision API](https://azure.microsoft.com/ja-jp/services/cognitive-services/computer-vision/)
<br><br>


<a name="emotion-api"></a>
#### 1-2. Emotion API
画像・動画の顔の表情から感情を判定する。<br>
画像上の顔の位置（left, top）、大きさ（width, height）と表情の成分 anger（怒り）, contempt（軽蔑）, disgust（嫌悪感）, fear（恐れ）, happiness（笑顔）, neutral（無表情）, sadness（悲しみ）, surprise（驚き）を0〜1の値で取得することができる。この数字が大きいほどその成分が多く含まれる。<br>
**1日に30,000トランザクション、1分あたり20回までリクエスト**できる。<br>
🔗 [Emotion API](https://azure.microsoft.com/ja-jp/services/cognitive-services/emotion/)


<br><hr><br>


<a name="phase-1-src-1"></a>
### 2. 解析方法 テキストベース
2-1. [Text Analytics API](#text-analytics-api)  
2-2. [Cloud Natural Language API](#cloud-natural-language-api)  
2-3. [極性辞書を使った形態素解析](#dictionary)
<br><br>


<a name="text-analytics-api"></a>
#### Text Analytics API
言語の特定。キーフレーズの特定。感情の認識（文章全体の評判分析し0 から1 の数値を返す。1 に近い数値は肯定的センチメント、0 に近い数値は否定的センチメント示す）。<br>
🔗 [Text Analytics API](https://azure.microsoft.com/ja-jp/services/cognitive-services/text-analytics/)
<br><br>


<a name="cloud-natural-language-api"></a>
#### Cloud Natural Language API
Google の機械学習を使って、非構造化テキストから分析情報を得ることができる。<br>
ドキュメント、ニュース記事、ブログ記事に含まれる人、場所、イベントなどに関する情報の抽出。ソーシャル メディア上のコメントから商品に対するセンチメント（感情）を把握したり、コールセンターやメッセージ アプリに寄せられた消費者の意見から顧客満足度を分析したりすることができる。<br>
🔗 [Cloud Natural Language API](https://cloud.google.com/natural-language/?hl=ja)
<br><br>


<a name="dictionary"></a>
#### 極性辞書を使った形態素解析
[単語感情極性対応表](http://www.lr.pi.titech.ac.jp/~takamura/pndic_ja.html)<br>
[日本語評価極性辞書 - 東北大学 乾・岡﨑研究室](http://www.cl.ecei.tohoku.ac.jp/index.php?Open%20Resources%2FJapanese%20Sentiment%20Polarity%20Dictionary)



<br><br><hr><br><br>




## 物理現象として再現、置き換え
### 素材一覧
- [極小LED光源「Luciola」（ルシオラ）](http://www.itmedia.co.jp/news/articles/1801/10/news083.html)
- [FLIP-DISC DISPLAY SYSTEM](https://breakfastny.com/flip-disc)
- ビーズ
- 磁石
- 蓄光塗料
- 吸水ポリマー
- [夜光虫](https://www.amazon.co.jp/dp/B01GOMJUFI/ref=cm_sw_r_tw_dp_U_x_S5SEAbFT6QDXE)
- [回転スピーカー](https://www.youtube.com/watch?v=BfESSykuswQ)


<br><br><hr><br><br>



## アウトプット
『物理現象として再現、置き換え』フェーズに渡せるデータフォーマットについて。<br>
組み合わせたり蓄積することも可能。プロトコルの調整（HTTP or OSC）もできます。

- 数値（例：各APIから取得した数値）
- 画像（例：各APIの分析対象の画像やスクリーンショット）
- 音声（例：文章の読み上げデータ mp3ファイル）



<br><br><hr><br><br>



### 参考リンク
- [Microsoft Word - 紀要0216_6.docx](http://repo.lib.hosei.ac.jp/bitstream/10114/12427/1/14R4103%E5%B8%82%E5%B7%9D%E7%A5%90%E5%A4%AA.pdf)<br>
新聞社の感情分析をして偏りを見る論文。<br>
Word2Vecで単語ベクトルを取り、単語辞書から感情極性値を与えて、評価する。

- [Amazon、Google、IBM、Microsoftが公開する、AIを使うための「API」「ライブラリ」「実行環境」一覧](http://www.itmedia.co.jp/news/articles/1703/08/news072.html)

- [Microsoft Cognitive Services API まとめ](https://qiita.com/daikiichikawa/items/1d9c0755b827ba5d24d4)
