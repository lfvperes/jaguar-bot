# The Jaguar Bot 🐆

<div align="right">

*the big cats, not the cars*

[![](https://img.shields.io/badge/Node.js-%2343853D.svg?&style=flat-square&logo=node.js&logoColor=white)]()
[![](https://img.shields.io/badge/Twitter-%231DA1F2.svg?&style=flat-square&logo=twitter&logoColor=white)](https://twitter.com/BotJaguar)
[![](https://img.shields.io/badge/GitKraken-%23179287.svg?&style=flat-square&logo=gitkraken&logoColor=white)](https://app.gitkraken.com/glo/board/YBhZjZOeNgARRwSK)

</div>

This project mainly consists in a Twitter Bot that searches for, stores and posts jaguar pictures. Written in Node.JS, it is constantly being updated and improved. The implementation brought along many features not proper to a Twitter Bot, making this project more than that.

### Main features:
- Twitter Bot
- Web Scraper
- Computer Vision API
- Cloud Storage
- Species Recognition Neural Network (TBD)

Albeit the project is far from completed, a release is intended to happen simply because the main basic bot features are ready and can be useful to other projects. It is a project of great importance for the author and, as such, needs to be showcased.

![](https://th.bing.com/th/id/Rbcc5abeda30fa754e4de74d46f82062f?rik=DanknrnPCpU3mA&riu=http://1.bp.blogspot.com/-ca7rtu0qMOw/UiEV0ANebZI/AAAAAAAAAco/AUsSD_BQSxY/s1600/Jaguar-wallpapers.jpg&ehk=OjefsTl9Pds3o8eLPtHjIKERtzI2O5VZIVfxq6jQzLA=&risl=&pid=ImgRaw)

### APIs used:
- Twitter API
- Bing Image Search JSON API
- MS Cognitive Services Computer Vision API
- Azure Storage Service REST API
### Node.JS libraries used:
- Image Downloader
- Node Twitter
### Environments:
This project was deployed on Heroku for testing and for learning purposes. It won't be deployed directly from GitHub anymore to avoid releasing API Keys.

Technically, the bot *works* and its deployment was successfully tested. Nevertheless, as of now, the bot is not online and won't be until it can fully operate on its own.

The progress can be tracked on [this GitKraken Board](https://app.gitkraken.com/glo/board/YBhZjZOeNgARRwSK) or on the [GitHub Project Board](https://github.com/lfvperes/jaguar-bot/projects/1) for the repository.

### Basic functions:
The bot can search for images based on a word of phrase and store its URLs in a JSON file. 

The stored URLs then undergo a "filtering" process using the CV API to determine whether the picture represents a _Jaguar car_ or a _Jaguar cat_, and "select" the URLs for pictures of _Jaguar cats_. The filter will be improved to also reject content related to sports teams.

When a "selected" URL is to be posted, it is separated from the unused URLs and uploaded to Azure, then it is posted. This _will be_ useful to compare the image to be posted with recently posted ones, avoiding close duplicates.

### How to use it
The bot already has many implemented working functions that may be useful for other projects, a tutorial will be compiled when the project is farther in development.
