# linked-estat

社会人口統計体系の可視化と DBpedia Japanese とのリンクセット応用アプリ

## Tool Demo

統計データを探し出し、可視化しつつ、DBpedia のトピックの検索を支援するツールです。

<http://indigo-lab.github.io/linked-estat/tool.html>


* 社会人口統計体系のインジケータ一覧が表示されています
* 任意のインジケータをクリックすると、右ペインにホイール状のグラフが表示されます
* ホイールの右上はヒストグラムになっています
* ヒストグラム下部の ▲ をドラッグすることで、着色のレンジを変更できます
* ホイールを構成する各セルは各統計観測データに対応しています
* セルをクリックすると当該年＋都道府県に関する DBpedia Japanese への検索が行われ、結果が表示されます

ツールを使った作業、または独自の検索を行うことで、
最終的に統計のインジケータと DBpedia Japanese のトピックの対応を得る、という想定のツールです。

## Sample

上記のツールの想定を元に作られたデータがあると仮定し、
このリンク情報を利用者向けのビューとして提示するデモです。


* <http://indigo-lab.github.io/linked-estat/view1.html>

不慮の事故の死者数をベースに、大規模災害の情報を関連付けて表示しています。


* <http://indigo-lab.github.io/linked-estat/view2.html>

年間参考気温をベースに、冷夏・米騒動といったトピックを関連付けて表示しています。






