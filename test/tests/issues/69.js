const { parse } = require('@test/test-target');

// https://github.com/taoqf/node-html-parser/issues/69
describe('issues/69', function () {
	it('should parse element embed as selfclosed tag', function () {
		const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>鄂尔多斯恩格贝生态示范区</title>
<link href="../../images/gl.css" type="text/css" rel="stylesheet">
</head>

<body onload="scrollTo(document.body.scrollWidth/5.5,0)">
<script>
function submitA(){
		var channelid=document.getElementById("channelid");
		channelid.value="214851";
        frmSearch.action="http://www.ordos.gov.cn/was40/search?channelid=214851";
        frmSearch.submit();
  }
  </script>
<table width="1006" border="0" cellspacing="0" cellpadding="0" align="center">
  <tbody><tr>
    <td id="top" align="center" style="height:270px;">

		 	<div class="TRS_Editor"><embed width="1014" height="282" src="../../fzlm/top_falsh/201901/W020190119606990532110.swf" type="application/x-shockwave-flash" scale="ShowAll" play="true" loop="true" menu="true" wmode="Transparent" quality="1" mediatype="flash" oldsrc="W020190119606990532110.swf"></div>

	</td>
  </tr>
</tbody></table>
<table width="1006" border="0" cellspacing="0" cellpadding="0" id="memu" align="center" \="">
  <tbody><tr>

        <td class="td1">
	         <a href="../../">首页</a>
	</td>
	<td><img src="../../images/menu_line.jpg"></td>
	<td class="td3">
		<a href="../">信息公开</a>
	</td>
	<td><img src="../../images/menu_line.jpg"></td>
	<td class="td3">
		<a href="../../zjegb/">走进恩格贝</a>
	</td>
	<td><img src="../../images/menu_line.jpg"></td>
	<td class="td3">
		<a href="../../tzegb/">投资恩格贝</a>
	</td>
	<td><img src="../../images/menu_line.jpg"></td>

	<td class="td3">
		<a href="../../lyegb/">旅游恩格贝</a>
	</td>
	<td><img src="../../images/menu_line.jpg"></td>
	<td class="td3">
		<a href="../../stjj/scy/">沙产业</a>
	</td>
	<td><img src="../../images/menu_line.jpg"></td>
	<td class="td3">
		<a href="../../stjj/xny/">新能源</a>
	</td>
	<td><img src="../../images/menu_line.jpg"></td>

  </tr>
</tbody></table>
<table width="1006" border="0" cellspacing="0" cellpadding="0" align="center">
  <tbody><tr>
    <td><img src="../../images/s_bj.jpg"></td>
  </tr>
</tbody></table>
<table width="1006" border="0" cellspacing="0" cellpadding="0" align="center" bgcolor="#FFFFFF">
  <tbody><tr>
        <td width="98" class="weather" style="padding-left:18px;">天气预报：</td>
	<td width="373" align="left">

<iframe allowtransparency="true" frameborder="0" width="317" height="28" scrolling="no" src="http://tianqi.2345.com/plugin/widget/index.htm?s=3&amp;z=1&amp;t=1&amp;v=0&amp;d=1&amp;bd=0&amp;k=&amp;f=&amp;q=1&amp;e=0&amp;a=1&amp;c=60976&amp;w=317&amp;h=28&amp;align=left"></iframe>

	</td>
      <td width="84">站内搜索：</td>
	<form name="frmSearch" action="http://was.ordos.gov.cn/was40/search" target="_blank" onsubmit="javascript:return setSearchword(this);"></form>
    <td width="300" valign="middle"><input type="text" name="searchword" id="input_t">
          <input type="hidden" name="channelid" id="channelid"></td>
    <td width="54" valign="middle"><img onclick="submitA();" src="../../images/ss_btn.jpg" style="cursor:hand;"></td>

        <td width="70"><img src="../../images/gs_btn.jpg" onclick="javascript:window.open('http://was.ordos.gov.cn/was40/searchtemplet/egb_gj.jsp','_blank');" style="cursor:hand;"></td>
       <!--<td width="159"><a href="http://mail.ordos.gov.cn/"><img src="../../images/email.jpg" /></a></td>-->
  </tr>
</tbody></table>
<table width="1006" border="0" height="875" cellspacing="0" cellpadding="0" class="mag1" align="center">
  <tbody><tr>
    <td align="center" bgcolor="#e1f1ff" width="253" valign="top">
    <table width="220" border="0" cellspacing="0" cellpadding="0">
	  <tbody><tr>
		<td><img src="../../images/xx_tit.jpg"></td>
	  </tr>
	  <tr>
		<td style="background:url(../../images/g_lbj.jpg) repeat-y;" align="center">
		<table width="155" border="0" cellspacing="0" cellpadding="0" class="gl_left">
                    <tbody><tr>
		        <td width="19"><img src="../../images/gl_ico.jpg"></td>
			<td width="136"><a href="../xxgkgd/" target="_self">信息公开规定</a></td>
		    </tr>
		    <tr>
			<td width="19"><img src="../../images/gl_ico.jpg"></td>
			<td width="136"><a href="../xxgkzd/" target="_self">信息公开制度</a></td>
		    </tr>
		    <tr>
			<td width="19"><img src="../../images/gl_ico.jpg"></td>
			<td width="136"><a href="../xxgkzn/" target="_self">信息公开指南</a></td>
		    </tr>
			 <tr>
				<td width="19"><img src="../../images/gl_ico.jpg"></td>
				<td width="136"><a href="../xxgkml/" target="_self">信息公开目录</a></td>
			 </tr>
			  <tr>
				<td width="19"><img src="../../images/gl_ico.jpg"></td>
				<td width="136"><a href="../ysqgklm/" target="_self">依申请公开</a></td>
			 </tr>
			 <tr>
				<td width="19"><img src="../../images/gl_ico.jpg"></td>
				<td width="136"><a href="./" target="_self">信息公开年报</a></td>
			 </tr>
			 <tr>
				<td width="19"><img src="../../images/gl_ico.jpg"></td>
				<td width="136"><a href="../xxgkscx/" target="_self">信息公开查询</a></td>
			 </tr>
			 <tr>
				<td width="19"><img src="../../images/gl_ico.jpg"></td>
				<td width="136"><a href="../rsxx/" target="_self">人事信息</a></td>
			</tr>
			 <tr>
				<td width="19"><img src="../../images/gl_ico.jpg"></td>
				<td width="136"><a href="../cwgk/" target="_self">财务公开</a></td>
			  </tr>

			<tr>
			        <td width="19"><img src="../../images/gl_ico.jpg"></td>
			        <td width="136"><a href="../zfcg/" target="_self">政府采购</a></td>
			 </tr>
			 <tr>
				<td width="19"><img src="../../images/gl_ico.jpg"></td>
				<td width="136"><a href="../yjgl/" target="_self">应急管理</a></td>
			</tr>

		</tbody></table>

		</td>
	  </tr>
	  <tr>
		<td><img src="../../images/g_ldb.jpg"></td>
	  </tr>
	</tbody></table>

	</td>
    <td bgcolor="#FFFFFF" valign="top">
	<table width="752" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:5px;">
	  <tbody><tr>
		<td><img src="../../images/xx_tiao.jpg"></td>
	  </tr>
	</tbody></table>
     <table width="752" height="761" border="0" cellpadding="0" cellspacing="0" class="bor">
	  <tbody><tr>
		<td class="pos" height="27">您现在的位置是：
			<a href="../../" title="首页" class="CurrChnlCls">首页</a>&nbsp;&gt;&gt;&nbsp;<a href="../" title="信息公开" class="CurrChnlCls">信息公开</a>&nbsp;&gt;&gt;&nbsp;<a href="./" title="信息公开年报" class="CurrChnlCls">信息公开年报</a>
		</td>
	  </tr>
	  <tr>
		<td height="678" valign="top">
		<table width="682" border="0" cellspacing="0" cellpadding="0" class="gl_list">

			  <tbody><tr valign="top" style="padding-bottom:10px;">
				<td width="25" style="padding-top:10px;"><img src="../../images/ico2.jpg"></td>
				<td width="550">
					<a href="./202009/t20200903_2748784.html">鄂尔多斯市2019年政府信息公开工作年度报告</a>
				</td>
				<td>
					2020-09-03
				</td>
			  </tr>


			  <tr valign="top" style="padding-bottom:10px;">
				<td width="25" style="padding-top:10px;"><img src="../../images/ico2.jpg"></td>
				<td width="550">
					<a href="./202005/t20200506_2633371.html">恩格贝生态示范区召开2020年度工作会暨党风廉政建设会议</a>
				</td>
				<td>
					2020-05-06
				</td>
			  </tr>


			  <tr valign="top" style="padding-bottom:10px;">
				<td width="25" style="padding-top:10px;"><img src="../../images/ico2.jpg"></td>
				<td width="550">
					<a href="./202003/t20200311_2593126.html">鄂尔多斯市人民政府办公室2019年政府信息公开工作年度报告</a>
				</td>
				<td>
					2020-03-11
				</td>
			  </tr>


			  <tr valign="top" style="padding-bottom:10px;">
				<td width="25" style="padding-top:10px;"><img src="../../images/ico2.jpg"></td>
				<td width="550">
					<a href="./201906/t20190614_2389850.html">恩格贝生态示范区召开目标责任制考核表彰大会</a>
				</td>
				<td>
					2019-06-14
				</td>
			  </tr>


			  <tr valign="top" style="padding-bottom:10px;">
				<td width="25" style="padding-top:10px;"><img src="../../images/ico2.jpg"></td>
				<td width="550">
					<a href="./201905/t20190530_2380968.html">鄂尔多斯市2018年政府信息公开年度报告</a>
				</td>
				<td>
					2019-05-30
				</td>
			  </tr>


			  <tr valign="top" style="padding-bottom:10px;">
				<td width="25" style="padding-top:10px;"><img src="../../images/ico2.jpg"></td>
				<td width="550">
					<a href="./201905/t20190530_2380967.html">内蒙古自治区2018年政府信息公开工作年度报告</a>
				</td>
				<td>
					2019-05-30
				</td>
			  </tr>


			  <tr valign="top" style="padding-bottom:10px;">
				<td width="25" style="padding-top:10px;"><img src="../../images/ico2.jpg"></td>
				<td width="550">
					<a href="./201811/t20181102_2290635.html">恩格贝生态示范区召开2018年度工作会议暨党风廉政建设会议</a>
				</td>
				<td>
					2018-03-26
				</td>
			  </tr>


			  <tr valign="top" style="padding-bottom:10px;">
				<td width="25" style="padding-top:10px;"><img src="../../images/ico2.jpg"></td>
				<td width="550">
					<a href="./201811/t20181102_2290607.html">恩格贝生态示范区：栽下梧桐引凤来</a>
				</td>
				<td>
					2018-01-05
				</td>
			  </tr>


			  <tr valign="top" style="padding-bottom:10px;">
				<td width="25" style="padding-top:10px;"><img src="../../images/ico2.jpg"></td>
				<td width="550">
					<a href="./201805/t20180525_2166460.html">一图读懂示范区2017年重点工作</a>
				</td>
				<td>
					2017-03-22
				</td>
			  </tr>


			  <tr valign="top" style="padding-bottom:10px;">
				<td width="25" style="padding-top:10px;"><img src="../../images/ico2.jpg"></td>
				<td width="550">
					<a href="./201802/t20180205_2082017.html">2016，恩格贝，精彩继续！</a>
				</td>
				<td>
					2017-01-07
				</td>
			  </tr>


		</tbody></table>

		</td>
	  </tr>
	  <tr>
		<td height="572" class="page">
                     <script language="JavaScript" type="text/javascript">
var currentPage = 0;//所在页从0开始
var prevPage = currentPage-1//上一页
var nextPage = currentPage+1//下一页
var countPage = 2//共多少页
//共计多少页
document.write("共计"+"&nbsp;<font style='color:#FF8008'>"+"2"+"&nbsp;</font>"+"页");
// 设置首页
document.write("&nbsp;<a href=\"index."+"html\">首页</a>&nbsp;|");

//设置上一页代码
if(countPage>1&&currentPage!=0&&currentPage!=1)
document.write("<a href=\"index"+"_" + prevPage + "."+"html\"><span class=greyfont>上一页</span></a>&nbsp;");
else if(countPage>1&&currentPage!=0&&currentPage==1)
document.write("<a href=\"index.html\">&nbsp;<span class=greyfont>上一页</span></a>&nbsp;");
else
document.write("&nbsp;上一页&nbsp;");

//循环
var num = 6;
if(currentPage<=3)
{
for(var i=0 ; i<=6 && (i<countPage); i++){
if(currentPage==i)
document.write("&nbsp;<font style='color:#FF8008'>"+(i+1)+"</font>&nbsp;|");
else if(i==0)
document.write("&nbsp;<a href=\"index.html\">1</a>&nbsp;|");
else
if(i>0) document.write("&nbsp;<a href=\"index"+"_" + i + "."+"html\">"+(i+1)+"</a>&nbsp;|");
//alert(i)
}
}
else
{
if(currentPage>(countPage-3))
{

for(var i=(countPage-6) ; i<countPage; i++){
if(currentPage==i)
document.write("&nbsp;<font style='color:#FF8008'>"+(i+1)+"</font>&nbsp;|");
else if(i==0)
document.write("&nbsp;<a href=\"index.html\">1</a>&nbsp;|");
else
if(i>0) document.write("&nbsp;<a href=\"index"+"_" + i + "."+"html\">"+(i+1)+"</a>&nbsp;|");
//alert(i)
}

}else
{
for(var i=(currentPage-3) ; i<=(currentPage+3) &&(i<countPage); i++){
if(currentPage==i)
document.write("&nbsp;<font style='color:#FF8008'>"+(i+1)+"</font>&nbsp;|");
else if(i==0)
document.write("&nbsp;<a href=\"index.html\">1</a>&nbsp;|");
else
if(i>0) document.write("&nbsp;<a href=\"index"+"_" + i + "."+"html\">"+(i+1)+"</a>&nbsp;|");
//alert(i)
}
}
}
//设置下一页代码
if(countPage>1&&currentPage!=(countPage-1))
document.write("&nbsp;<a href=\"index"+"_" + nextPage + "."+"html\">&nbsp;<span class=greyfont>下一页</span>&nbsp;</a>&nbsp;");

else
document.write("&nbsp;下一页&nbsp;");
// 设置尾页
if(countPage!=1)
document.write("&nbsp;<a href=\"index"+"_" + (countPage-1)  + "."+"html\">尾页</a>&nbsp;");
else
document.write("&nbsp;尾页&nbsp;");
 //跳转页数脚本开始
 document.write(" 转到 <input type='text' id='itemNum' size='5' style='height:15px; width:33px' />&nbsp;<input type='button' style='background-color:#333333; border-color:#006633; height:20px; width:28px; color:#FFFFFF; font-weight:bold' value='GO' onClick='goto();' />");
 var itemNum=document.getElementById("itemNum").value=currentPage+1;
 function goto(){
 var itemNum=document.getElementById("itemNum").value;
 if(itemNum>1&&itemNum<=countPage){
   window.navigate("index_"+(itemNum-1)+".html");
}
else if(itemNum==1){
   window.navigate("index.html");
}
else{
alert("输入的数字不在页数范围内！");
}
}
 //跳转页数脚本结束
</script>共计&nbsp;<font style="color:#FF8008">2&nbsp;</font>页&nbsp;<a href="index.html">首页</a>&nbsp;|&nbsp;上一页&nbsp;&nbsp;<font style="color:#FF8008">1</font>&nbsp;|&nbsp;<a href="index_1.html">2</a>&nbsp;|&nbsp;<a href="index_1.html">&nbsp;<span class="greyfont">下一页</span>&nbsp;</a>&nbsp;&nbsp;<a href="index_1.html">尾页</a>&nbsp; 转到 <input type="text" id="itemNum" size="5" style="height:15px; width:33px">&nbsp;<input type="button" style="background-color:#333333; border-color:#006633; height:20px; width:28px; color:#FFFFFF; font-weight:bold" value="GO" onclick="goto();">
                </td>
	  </tr>
	</tbody></table>

	</td>
  </tr>
</tbody></table>
<table width="1006" border="0" cellspacing="0" cellpadding="0" height="136" id="down" align="center">
  <tbody><tr>
    <td align="center"><table width="684" height="91" border="0" cellpadding="0" cellspacing="0" class="about" style="margin-top:18px;">
  <!--<tr>
    <td width="609" align="center"><a href="../../dbdh/gywm/" >关于我们</a> | <a href="../../dbdh/wyjy/" >网友建议</a> | <a href="../../dbdh/xxbz/">信息保障</a> | <a href="../../dbdh/lxwm/" >联系我们</a> |
      </td>
  </tr>--><!--访问量<script src="http://s17.cnzz.com/stat.php?id=2896628&web_id=2896628&show=pic" language="JavaScript"></script>-->
  <tbody><tr>
    <td align="center">主办：鄂尔多斯市恩格贝生态示范区管委会　<a href="../../wzdt/" target="_blank">网站地图</a> <script src="http://s17.cnzz.com/stat.php?id=2896628&amp;web_id=2896628&amp;show=pic" language="JavaScript"></script><script src="http://c.cnzz.com/core.php?web_id=2896628&amp;show=pic&amp;t=z" charset="utf-8" type="text/javascript"></script><a href="https://www.cnzz.com/stat/website.php?web_id=2896628" target="_blank" title="站长统计"><img border="0" hspace="0" vspace="0" src="http://icon.cnzz.com/img/pic.gif"></a>   |  <a href="../../dbdh/lxwm/">联系我们</a> </td>
  </tr>
  <tr>
    <td align="center">违法和不良信息举报电话：0477-2258659(工作时间)&nbsp;&nbsp;邮箱：egb@ordos.gov.cn <br>
      　
      建议使用：1024×768分辩率 真彩32位浏览 <font color="#000000">网站标识码：1506000140</font></td>
  </tr>
  <tr>
    <td align="center">　中文域名：鄂尔多斯市恩格贝生态示范区管理委员会.政务&nbsp;<a href="http://www.beian.miit.gov.cn/" target="_blank"> 蒙ICP备13001412号-2</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        <img src="../../images/W020190117350825039697.png" style="float:center;"><a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=15062102000168" style="color: #000000;text-decoration: none;">&nbsp;&nbsp;&nbsp;蒙公网安备 15062102000168号</a> </td>
  </tr>
  <tr>
    <td align="center"><script type="text/javascript">document.write(unescape("%3Cspan id='_ideConac' %3E%3C/span%3E%3Cscript src='http://dcs.conac.cn/js/07/136/0000/40624487/CA071360000406244870001.js' type='text/javascript'%3E%3C/script%3E"));</script><span id="_ideConac"><a href="//bszs.conac.cn/sitename?method=show&amp;id=05C2ED68A8F661C9E053012819ACF5E5" target="_blank"><img id="imgConac" vspace="0" hspace="0" border="0" src="//dcs.conac.cn/image/blue.png" data-bd-imgshare-binded="1"></a></span><script src="http://dcs.conac.cn/js/07/136/0000/40624487/CA071360000406244870001.js" type="text/javascript"></script><span id="_ideConac"></span>
    </td>
    <td width="96"> <script id="_jiucuo_" sitecode="1506000140" src="http://pucha.kaipuyun.cn/exposure/jiucuo.js"></script> </td>
  </tr>
</tbody></table></td>
  </tr>
</tbody></table>

</body></html>`;
		const root = parse(html, { comment: true });
		root.toString().should.eql(html);
	});
});
