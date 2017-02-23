# STEEM and GOLOS Escrow Transactions GUI
GUI for sending STEEM/SBD and GOLOS/GBG with escrow.

This is HTML page and it works without server. You can download files and use it from local machine. Run **index.html**.

Online version is available here: https://golosim.ru/escrow/index.html

# Description
You can read description of project with screenshots here:
+ [ENG] on steemit.com [Open Source standalone GUI for Steem escrow transactions](https://steemit.com/escrow/@xtar/open-source-standalone-gui-for-steem-escrow-transactions).
+ [RU] on golos.io [Гаранты на блокчейне Голоса: GUI для отправки GOLOS/GBG](https://golos.io/ru--golos/@escrows/garanty-na-golose-gui-dlya-otpravki-golos-gbg-s-garantom).

# Tech
+ using [steem.js v0.4.8](https://github.com/steemit/steem-js) with small changes on [line 11193](https://github.com/MrXtar/steem-golos-escrow-gui/blob/master/js/steem.js#L11193) to support both blockchains (Steem and Golos).
+ HTML + CSS + JQuery