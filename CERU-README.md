# 澜音（CeruMusic）插件 · MusicFree 适配版

> 由 `hebijunge/musicfree-plugins` 的 57 个 MusicFree 插件自动适配为澜音 v2 原生插件，并做高强度混淆（RC4 字符串数组 + 控制流扁平化 + 十六进制标识符）。
> 未混淆源码仅存于私有仓，公开仓只有混淆产物。

## 安装

1. 打开澜音 → 插件管理 → 添加插件（订阅），粘贴下表中某个插件的 **raw URL**。
2. 或点击直链下载 `.js`，用「从文件导入」。
3. 首次启用授予 **network（网络访问）** 权限。

## 说明

- 搜索 / 取链 / 歌词来自原 MusicFree 插件，网络经澜音宿主代理（`core.http.request`），遵守澜音沙箱安全策略。
- 榜单（getTopLists）在部分插件上可用；歌单导入（importMusicSheet）暂未桥接。
- 混淆档位：默认高强度；超大插件（如 agg）自动降级为轻量档以满足澜音 50 万 AST 节点上限。

## 插件列表（57 个）

| 名称 | 版本 | 能力 | 混淆 | 大小 | raw URL |
| --- | --- | --- | --- | --- | --- |
| 001《爱情时代》 | 1.0.3 | search/getMediaSource/getLyric/getTopLists | 重 | 1576KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/xiangsheng-pingshu-source.plugin.ceru.js) |
| 5sing | 1.0.2 | search/getMediaSource/getLyric/importMusicSheet | 重 | 77KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/5sing-source.plugin.ceru.js) |
| 73DJ | 1.0.1 | search/getMediaSource/getLyric | 重 | 1564KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/73dj-source.plugin.ceru.js) |
| 宝贝DJ | 1.2.1 | search/getMediaSource/getLyric/getTopLists | 重 | 1568KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/bibdj-source.plugin.ceru.js) |
| 波比DJ | 1.0.1 | search/getMediaSource/getLyric/getTopLists | 重 | 1906KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/bobidj-source.plugin.ceru.js) |
| 串烧舞曲 | 1.2.2 | search/getMediaSource/getLyric/getTopLists | 重 | 1562KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/36dj-source.plugin.ceru.js) |
| 串烧舞曲 | 1.2.1 | search/getMediaSource/getLyric/getTopLists | 重 | 1591KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/82dj-source.plugin.ceru.js) |
| 串烧舞曲 | 1.2.2 | search/getMediaSource/getLyric/getTopLists | 重 | 1502KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/ddddj-source.plugin.ceru.js) |
| 纯音乐 | 1.2.3 | search/getMediaSource/getLyric/getTopLists | 重 | 1569KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/htqyy-source.plugin.ceru.js) |
| 电音阁 | 1.1.2 | search/getMediaSource/getLyric/getTopLists | 重 | 1569KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/dianyinge-source.plugin.ceru.js) |
| 番茄畅听 | 1.3.1 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 150KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/fanqie-source.plugin.ceru.js) |
| 黑色音频 | 1.1.2 | search/getMediaSource/getLyric/getTopLists | 重 | 1566KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/hy57-source.plugin.ceru.js) |
| 华为音乐 | 1.0.3 | search/getMediaSource/getLyric/getTopLists | 重 | 156KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/hwmusic-source.plugin.ceru.js) |
| 火龙DJ | 1.0.4 | search/getMediaSource/getTopLists/importMusicSheet | 重 | 100KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/huolongdj-source.plugin.ceru.js) |
| 街声 | 1.0.1 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 69KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/streetvoice-source.plugin.ceru.js) |
| 酷狗音乐 | 1.9.24 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 729KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/kugou-source.plugin.ceru.js) |
| 酷我音乐 | 1.9.24 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 687KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/kuwo-source.plugin.ceru.js) |
| 快音 | 1.0.2 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 438KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/kuaiyin-source.plugin.ceru.js) |
| 懒人听书 | 1.0.3 | search/getMediaSource/getLyric/importMusicSheet | 重 | 95KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/lrts-source.plugin.ceru.js) |
| 荔枝FM | 1.0.2 | search/getMediaSource/getLyric | 重 | 65KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/lizhi-source.plugin.ceru.js) |
| 猫耳FM | 1.0.3 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 79KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/missevan-source.plugin.ceru.js) |
| 魅力DJ | 1.0.1 | search/getMediaSource/getLyric/getTopLists | 重 | 39KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/djmei-source.plugin.ceru.js) |
| 咪咕音乐 | 1.9.20 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 992KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/migu-source.plugin.ceru.js) |
| 千千音乐 | 1.0.4 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 183KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/qianqian-source.plugin.ceru.js) |
| 蜻蜓FM | 1.0.3 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 94KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/qingting-source.plugin.ceru.js) |
| 少年读物 | 1.0.2 | search/getMediaSource/getLyric/importMusicSheet | 重 | 79KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/bokantingshu-source.plugin.ceru.js) |
| 水晶舞曲 | 1.2.2 | search/getMediaSource/getTopLists | 重 | 1557KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/dj14-source.plugin.ceru.js) |
| 网易云电台 | 1.1.3 | search/getMediaSource/getLyric | 重 | 745KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/neteaseradio-source.plugin.ceru.js) |
| 网易云音乐 | 1.9.27 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 342KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/netease-source.plugin.ceru.js) |
| 我是DJ | 1.1.2 | search/getMediaSource/getLyric/getTopLists | 重 | 1551KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/54dj-source.plugin.ceru.js) |
| 喜马拉雅 | 1.2.1 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 98KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/ximalaya-source.plugin.ceru.js) |
| 先上DJ | 1.1.1 | search/getMediaSource/getLyric/getTopLists | 重 | 1503KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/xsdj123-source.plugin.ceru.js) |
| 现场串烧 | 1.2.2 | search/getMediaSource/getLyric/getTopLists | 重 | 1559KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/qqdjs-source.plugin.ceru.js) |
| 小熊电音 | 1.0.2 | search/getMediaSource/getLyric | 重 | 1479KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/xxedm-source.plugin.ceru.js) |
| 一听音乐 | 1.0.2 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 48KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/1ting-source.plugin.ceru.js) |
| agg | 1.9.19 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 轻 | 1787KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/agg-source.plugin.ceru.js) |
| Apple Music | 1.0.2 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 171KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/apple-music.ceru.js) |
| B站 | 1.1.4 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 651KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/bilibili-source.plugin.ceru.js) |
| CCTV听音 | 1.0.2 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 58KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/cctv-source.plugin.ceru.js) |
| DJ6 | 1.0.2 | search/getMediaSource/getLyric/getTopLists | 重 | 1541KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/dj6-source.plugin.ceru.js) |
| DJ766 | 1.4.1 | search/getMediaSource/getLyric/getTopLists | 重 | 1561KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/dj766-source.plugin.ceru.js) |
| DJ多多 | 1.0.2 | search/getMediaSource/getTopLists/importMusicSheet | 重 | 121KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/djduoduo-source.plugin.ceru.js) |
| DJ耶耶耶 | 1.1.2 | search/getMediaSource/getTopLists | 重 | 1573KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/djyyy-source.plugin.ceru.js) |
| DJ娱乐 | 1.2.1 | search/getMediaSource/getLyric/getTopLists | 重 | 1483KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/djyule-source.plugin.ceru.js) |
| djkk | 1.1.2 | search/getMediaSource/getLyric/getTopLists | 重 | 1552KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/djkk-source.plugin.ceru.js) |
| djshow | 1.0.4 | search/getMediaSource/getLyric/getTopLists | 重 | 442KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/djshow.plugin.ceru.js) |
| djuu | 1.1.2 | search/getMediaSource/getTopLists/importMusicSheet | 重 | 84KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/djuu-source.plugin.ceru.js) |
| Jamendo | 1.0.2 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 65KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/jamendo-source.plugin.ceru.js) |
| JOOX音乐 | 1.1.3 | search/getMediaSource/getLyric | 重 | 98KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/joox-source.plugin.ceru.js) |
| M2103K19C | 1.0.1 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 84KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/djcsj-source.plugin.ceru.js) |
| MixDJ | 1.0.2 | search/getMediaSource/getLyric/getTopLists | 重 | 1556KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/mixdj-source.plugin.ceru.js) |
| pgdjz | 1.1.2 | search/getMediaSource/getLyric/getTopLists | 重 | 1575KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/pgdjz-source.plugin.ceru.js) |
| qishui | 1.9.23 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 793KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/qishui-source.plugin.ceru.js) |
| QQ音乐 | 1.9.26 | search/getMediaSource/getLyric/getTopLists/importMusicSheet | 重 | 782KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/qq-source.plugin.ceru.js) |
| SpaceDJ | 1.1.2 | search/getMediaSource/getLyric/getTopLists | 重 | 48KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/spacedj-source.plugin.ceru.js) |
| Top40 | 1.2.1 | search/getMediaSource/getLyric/getTopLists | 重 | 1576KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/172mix-source.plugin.ceru.js) |
| Y2002电音 | 1.0.2 | search/getMediaSource/getLyric/getTopLists | 重 | 98KB | [链接](https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/ceru-plugins/y2002-source.plugin.ceru.js) |
