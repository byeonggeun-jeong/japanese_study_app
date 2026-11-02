# Content attribution

## License scope

The original application source code, newly authored learning content (except
adaptations identified below), and documentation are licensed under the root
MIT LICENSE. This does not relicense third-party material. In particular,
src/content/vocabulary/lexicon.json remains CC BY-SA 4.0, the bundled
Pretendard font remains SIL OFL 1.1, and dependencies retain their own licenses.

The vocabulary data is adapted from **OpenJLPT**, by the OpenJLPT contributors (`evanclan/OpenJLPT`).

- Source: https://github.com/evanclan/OpenJLPT
- License: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
- License URL: https://creativecommons.org/licenses/by-sa/4.0/
- Retrieved: 2026-11-01, `data/json/vocab/n5.json` and `n4.json`.
- Upstream attribution: `licenses/OpenJLPT-NOTICE.md`.
- License text: `licenses/CC-BY-SA-4.0.txt`.

Changes: selected N5/N4 written forms, readings, level labels, parts of speech and stable IDs; removed upstream example sentences; added and reviewed Korean definitions and newly written Japanese usage contexts. Three initial words (水, 山, 約束) are authored separately. The modified vocabulary file is provided under CC BY-SA 4.0 in the source project and in the installed application's `resources/content/lexicon.json`.

OpenJLPT's underlying vocabulary and level assignments include Jonathan Waller's community JLPT lists and the EDRDG's JMdict data. Refer to the preserved upstream notice for their attribution and license details.

The grammar explanations, grammar examples, everyday readings, kana exercises and question presentation are newly authored for this project. They are not official JLPT questions. The app is not affiliated with the Japan Foundation or Japan Educational Exchanges and Services.

React and other software dependencies retain their own licenses. The current
local-web distribution does not bundle Electron or Node.js. Node.js and the web
browser are installed separately from their respective official distributions.
React and React DOM 19.3.1 are bundled in the browser build under the MIT license
by Meta Platforms, Inc. and affiliates, preserved in licenses/React-MIT.txt.
Source: https://github.com/facebook/react

## Pretendard

Bundled unmodified Pretendard Variable v1.3.9 by Kil Hyung-jin (orioncactus).
Source: https://github.com/orioncactus/pretendard/tree/v1.3.9
License: SIL Open Font License 1.1, included as licenses/Pretendard-OFL.txt.
The font is embedded in the app for offline use; no font service is contacted.
