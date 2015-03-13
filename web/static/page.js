seajs.config({
    base: 'http://static.alipayobjects.com/',
    alias: {
		'$' : 'jquery/jquery/1.7.2/jquery'
    }
});

//encode html entity ,and keep the tag generated by ansi2html
var encodeHtmlEntity = function(str) {
  	var buf = [];
	for (var i=str.length-1;i>=0;i--) {
		if(/[a-zA-Z:"]/.test(str[i])){ //a-z A-Z :
			buf.unshift(str[i]);
		}else{
			buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
		}
 	}
 	return buf.join('');
};


seajs.use(['$'], function($) {

	var specialPlaceholder = ["_httpwatch_beginA", "_httpwatch_beginB", "_httpwatch_end"];
	var specialReplacement = ['<span style="', '">', '</span>'];
	
	function esacpeHTML(data){
		// var html = ansi2html(encodeHtmlEntity(event.data));
		var htmlA, htmlB, htmlC;

		htmlA = ansi2html(event.data);
		htmlB = encodeHtmlEntity(htmlA);

		htmlC = htmlB;
		specialPlaceholder.map(function(item,index){
			var reg = new RegExp(encodeHtmlEntity(item));
			reg.global = true;

			htmlC = htmlC.replace(reg,specialReplacement[index]);
		});

		console.log(htmlA);
		console.log(htmlC);

		return htmlC;
	}

	$(function(){
		//data via web socket
		if(!WebSocket){
			alert("WebSocket is required. Please use a modern browser.");
		}

		var listWrapper = $(".J_mainList"),
			firstAppend = true;
		function appendRecord(data){
			if(firstAppend){
				firstAppend = false;
				listWrapper.empty();
			}
			listWrapper.append(esacpeHTML(data));
			window.scrollTo(0,document.body.scrollHeight);
		}

		var indicatorEl = $(".J_socketStatus");
		function switchStatusIndicator(newStatus){
			indicatorEl.removeClass("status_success").removeClass("success_fail").removeClass("status_waiting");
			indicatorEl.addClass("status_" + newStatus);
		}

		var socketPort  = $("#socketPort").val(),
			baseUrl     = location.hostname,
			dataSocket  = new WebSocket("ws://" + baseUrl + ":" + socketPort);

		dataSocket.onopen = function(){
			switchStatusIndicator("success");
		}

		dataSocket.onmessage = function(event){
			appendRecord(event.data);
		}

		dataSocket.onclose = dataSocket.onerror = function(e){
			console.log(e);
			switchStatusIndicator("fail");
		}
	});
});
