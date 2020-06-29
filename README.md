# cross-rust-analyzer

This is a companion extension for the [rust-analyzer](https://rust-analyzer.github.io/) adding [cross](https://github.com/rust-embedded/cross) support.

To enable `cross` for a project you need to add `"rust-analyzer.cargoRunner": "cross-rust-analyzer"` to the settings.json. Then it is possible to select a target from status bar or specify manually in the settings.json: `"cross-rust-analyzer.target":"arm-unknown-linux-gnueabi"`.

![screencast](https://user-images.githubusercontent.com/62505555/85128783-a7b92f00-b23a-11ea-8050-b39edbd7319c.gif)
