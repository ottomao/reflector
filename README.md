Reflector
===================
Your terminal, Reflected.
把命令行输出到本地http服务器上，用你的ipad/手机屏幕做监控屏，酷酷哒。


Intro
-------------------
**Reflector** would forward your terminal output to a web page. View that page on your mobile device, and you will get another screen watching your terminal.


Install
-------------------
* install [NodeJS](http://nodejs.org/)
* ``sudo npm install -g shell-reflector``


How to use
-------------------
* pipe your output to reflector , e.g. ``my_long_runing_command | reflector``
* view web page according to the url in terminal


Misc
-------------------
* for security reasons, please do not use it on production server.
* Author : Otto Mao ottomao@gmail.com
* Licence MIT