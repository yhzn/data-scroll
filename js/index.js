window.requestAnimationFrame =
    window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame;
var isBasic = (it) => {
    return it === null || ( typeof it !== 'object' && typeof it !== 'array' );
}

var clone = function (it) {
    if (isBasic(it)) {
        return it;
    }
    let result = Array.isArray(it) ? [] : {};
    for (let i in it) {
        result[i] = clone(it[i]);
    }
    return result;
}
var  option={
    color:["#f9ac0e","#29fffb","#ec6961","#faff37","##bb9dff","#4bfe5a","#edde05"],
    tooltip: {
        trigger: 'axis'
    },
    grid: {
        top:'12%',
        left: '5%',
        right: '3%',
        bottom: '5%',
        containLabel: true
    },
    xAxis: {
        type: 'category',
        axisLine:{
            lineStyle:{
                color:'#fff',
                width:1,//  坐标轴宽度 这里是为了突出显示加上的
            },
        },
        axisLabel:{
            rotate:30,
        },
        boundaryGap: true,
        data: []
    },
    yAxis: [],
    series: []
};
var nullOption={
    title:{
        text:"无异常",
        left:"center",
        top:"30%",
        textStyle:{//标题内容的样式
            fontSize:"38",
            color:'#13b63a',//京东红
            fontStyle:'normal',//主标题文字字体风格，默认normal，有italic(斜体),oblique(斜体)
            // fontWeight:"lighter",//可选normal(正常)，bold(加粗)，bolder(加粗)，lighter(变细)，100|200|300|400|500...
            fontFamily:"san-serif",//主题文字字体，默认微软雅黑
        },
    }
}
var app=new Vue({
    el:'#app',
    data:{
        message:"hello vue",
        year:"",
        month:"",
        date:"",
        hours:"",
        minutes:"",
        day:"",
        unusual:[],
        upServer:null,
        upDataBase:null,
        downServer:null,
        downDataBase:null,
        upDisk:[],
        downDisk:[],
        scroll:0,
        speed:.5,
        dynamicUnusual:[],
        unusualDomHeight:null,
        unusualConHeight:null,
        unusualDom:null,
        unusualLength:0,
        seconds:0,
        timeCount:0,
        allDataRefresh:0,         // 数据刷新时间
        SystemDBBase:[],          // 服务器数据列表
        SystemDBBaseLength:0,
        upServerIdArr:[],         // 数据库列表
        upServerIdArrLength:0,
        downServerIdArr:[],       // 数据库列表
        downServerIdArrLength:0,
        upSystemIp:"",            // 服务器IP
        downSystemIp:"",
        upSystemName:"",          // 服务器名称
        downSystemName:"",
        upDBName:"",
        downDBName:"",
        showSystemNum:0,
        showUpServerNum:0,
        showDownServerNum:0,
        refreshTime:10,      // 刷新时间控制
        upDataTimeRefresh:0, // 上数据库数据刷新
        downDataTimeRefresh:0, // 下数据库数据刷新
        unusualTimeRefresh:0, // 异常信息数据刷新
        serverTimeRefresh:0,
        oddNum:false,
        unusualFlag:true,
        unusualTemp:[],
        upWarning:0,
        downWarning:0,
},
    mounted:function(){
        var _this=this;
        var weekArray = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
        this.day = weekArray[new Date().getDay()]
        var getDate=new Date();
        this.year=getDate.getFullYear();
        this.month=getDate.getMonth()+1 <10 ?"0"+(getDate.getMonth()+1):getDate.getMonth()+1;
        this.date=getDate.getDate()<10 ? "0" + getDate.getDate():getDate.getDate();
        this.hours=getDate.getHours()<10 ? "0"+getDate.getHours():getDate.getHours();
        this.minutes=getDate.getMinutes()<10 ? "0"+getDate.getMinutes():getDate.getMinutes();
        this.seconds=getDate.getSeconds()+1;

        this.upServer=echarts.init(this.$refs.upServer);
        this.upDataBase=echarts.init(this.$refs.upDataBase);
        this.downServer=echarts.init(this.$refs.downServer);
        this.downDataBase=echarts.init(this.$refs.downDataBase);

        this.getServer();
        this.getUnusual();

        this.unusualConHeight=this.$refs.unusualCon.offsetHeight;
        window.requestAnimationFrame(this.animation);
        // if(!!this.setTimer){
        //     clearTimeout(this.setTimer);
        // }
        // this.setTimer=setTimeout(this.animation,1000/60);
        document.onkeyup=function(e){
            if(e.keyCode===122){
                window.location.reload();
            }
        }
        window.onresize=function(){
            _this.upServer.resize();
            _this.upDataBase.resize();
            _this.downServer.resize();
            _this.downDataBase.resize();
            // _this.unusualConHeight=_this.$refs.unusualCon.offsetHeight;
            // // 动画重载
            // if(!!_this.unusualConHeight &&
            //     parseInt(_this.$refs.unusual.offsetHeight)>=parseInt(_this.unusualConHeight) &&
            //     parseInt(_this.$refs.unusual.offsetHeight)!==parseInt(_this.unusualDomHeight)
            // ){
            //     this.unusualDomHeight=_this.$refs.unusual.offsetHeight;
            //     this.unusualDom=_this.$refs.unusual;
            // }
        }
    },
    updated:function(){

        // 刷新数据更新错误列表
        this.unusualDomHeight=this.$refs.unusual.offsetHeight;
        this.unusualDom=this.$refs.unusual;
    },
    methods:{
        timeRefresh:function(){
            let getDate = new Date();
            let minutes=getDate.getMinutes()<10 ? "0"+getDate.getMinutes():getDate.getMinutes();
            if(this.minutes!==minutes){
                this.hours=getDate.getHours()<10 ? "0"+getDate.getHours():getDate.getHours();
                this.minutes=minutes;
                if((this.hours==="00"||this.hours==="06") && (this.minutes === "00" || this.minutes==="01")){
                    window.location.reload();
                }
            }
        },
        dataRefresh:function(){
            if(this.showSystemNum>=this.SystemDBBaseLength-1){
                this.showSystemNum=0;
            }
            this.upWarning=this.SystemDBBase[this.showSystemNum].Warning;
            this.upSystemIp=this.SystemDBBase[this.showSystemNum].SystemIpAddress;
            this.upSystemName=this.SystemDBBase[this.showSystemNum].SystemName;
            this.getData("upServer",this.SystemDBBase[this.showSystemNum].SysNo,"upDisk");
            this.getBase("upDataBase",this.SystemDBBase[this.showSystemNum].SystemIpAddress,"upServerIdArr");
            this.showSystemNum=this.showSystemNum+1;
            this.downWarning=this.SystemDBBase[this.showSystemNum].Warning;
            this.downSystemIp=this.SystemDBBase[this.showSystemNum].SystemIpAddress;
            this.downSystemName=this.SystemDBBase[this.showSystemNum].SystemName;
            this.getData("downServer",this.SystemDBBase[this.showSystemNum].SysNo,"downDisk");
            this.getBase("downDataBase",this.SystemDBBase[this.showSystemNum].SystemIpAddress,"downServerIdArr");
            // this.getBase("upDataBase",data.Infos[0].SystemIpAddress,"upServerIdArr");
            this.showSystemNum++;

        },
        upDataBaseRefresh:function(){
            // this.showUpServerNum
            if (this.showUpServerNum >= this.upServerIdArrLength - 1) {
                this.showUpServerNum = 0;
            }
            this.getDataBase("upDataBase", this.upServerIdArr[this.showUpServerNum++].SysNo);
        },
        downDataBaseRefresh:function(){
            // this.showUpServerNum
            if (this.showDownServerNum >= this.downServerIdArrLength - 1) {
                this.showDownServerNum = 0;
            }
            this.getDataBase("downDataBase", this.downServerIdArr[this.showDownServerNum++].SysNo);
        },
        animation:function(){
            // clearTimeout(this.setTimer);
            // 奇偶数据刷新时间修正
            if(this.oddNum){
                this.weight=1;
            }else{
                this.weight=2;
            }

            // 刷新时间
            this.timeCount++;
            if(this.timeCount>=60*11){
                this.timeRefresh();
                this.timeCount=0;
            }
            // 服务列表刷新  若无服务器列表数据 每一分钟刷新一次
            this.serverTimeRefresh++;
            if(this.SystemDBBaseLength===0 && this.serverTimeRefresh>60*60){
                this.getServer();
                this.serverTimeRefresh=0;

            }
            // 若服务器列表存在数据 数据循环一周后刷新
            if(this.SystemDBBaseLength!==0 && this.serverTimeRefresh>=30*this.refreshTime*this.SystemDBBaseLength*this.weight){
                this.getServer();
                this.serverTimeRefresh=0;
            }

            // 服务器数据展示 每 refreshTime 轮播一次
            this.allDataRefresh++;
            if(this.allDataRefresh>=60*this.refreshTime){
                if(this.SystemDBBaseLength>=3){
                   this.dataRefresh();
                    // 上数据库数据刷新
                    this.upDataTimeRefresh=0;

                    // 下数据库数据刷新
                    this.downDataTimeRefresh=0;

                }
                // 服务器数据刷新
                this.allDataRefresh=0;

            }

            // 上数据库数据刷新 数据多条的情况下 每 this.refreshTime/this.upServerIdArrLength 轮播一次
            this.upDataTimeRefresh++;
            if(this.upServerIdArrLength!==0 && this.upDataTimeRefresh>=60*parseInt(this.refreshTime/this.upServerIdArrLength)){
                if(this.upServerIdArrLength>=1) {
                    this.upDataBaseRefresh();
                }
                // 上数据库数据刷新
                this.upDataTimeRefresh=0;
            }
            // 下数据库数据刷新
            this.downDataTimeRefresh++;
            if(this.downServerIdArrLength!==0 && this.downDataTimeRefresh>=60*parseInt(this.refreshTime/this.downServerIdArrLength)){
                if(this.downServerIdArrLength>=1) {
                    this.downDataBaseRefresh();
                }
                // 下数据库数据刷新
                this.downDataTimeRefresh=0;
            }
            // 异常信息数据刷新
            this.unusualTimeRefresh++;
            // 每 this.refreshTime 刷新一次
            if(this.unusualTimeRefresh>=60*this.refreshTime){
                // this.unusualTimeRefresh>=60*this.refreshTime*this.SystemDBBaseLength
                this.getUnusual(true);
                this.unusualTimeRefresh=0;
            }
            // 数据加倍后 任充不满容器情况
            if(this.unusualFlag && !!this.unusualDom && parseInt(this.unusualDomHeight)<=parseInt(this.unusualConHeight)){
                this.unusualFlag=false;
                this.unusual.splice(0,this.unusualLength/2);
            }
            // 数据加倍后 充满容器 但去除重复数据后 未冲满容器情况
            if(!!this.unusualDom && parseInt(this.unusualDomHeight)>parseInt(this.unusualConHeight)){
                if(this.unusualFlag && parseInt(this.unusualDomHeight/2)<=parseInt(this.unusualConHeight)){
                    this.unusualFlag=false;
                    this.unusual.splice(0,this.unusualLength/2);
                }
                if(parseInt(this.unusualDomHeight/2)>parseInt(this.unusualConHeight)){
                    this.scroll+=this.speed;
                    if(-1*parseInt(this.unusualDom.style.marginTop)>=this.unusualDomHeight/2){
                        if(this.unusualTemp.length!==0){
                            // 轮播一周后 更新异常数据
                            this.unusual=this.unusualTemp;
                            this.unusualLength=this.unusualTemp.length;
                            this.unusualTemp=[];
                            this.unusualFlag=true;
                        }
                        this.scroll=10+this.speed;
                    }
                    this.unusualDom.style.marginTop=-1*this.scroll+"px";
                }
            }

            // this.setTimer=setTimeout(this.animation,1000/60);
            window.requestAnimationFrame(this.animation);

        },
        getDataBase:function(dom,sys){
            var _this=this;
            $.ajax({
                url:"http://172.31.10.153:6088/json/reply/SearchDataBaseInfoForChartReq",
                type:"post",
                data:{
                    DataBaseSysNo: sys
                },
                success:function(data){
                    let upDataBaseOption=clone(option);
                    if(data.CreateTime.length===0){
                        _this[dom].setOption(nullOption,true);
                        return false;
                    }
                    upDataBaseOption.grid.right="10%";
                    upDataBaseOption.xAxis.data=data.CreateTime;
                    upDataBaseOption.yAxis.push(
                        {
                            name:"内存（MB）",
                            type: 'value',
                            axisLine:{
                                lineStyle:{
                                    color:'#fff',
                                    width:1,//  坐标轴宽度 这里是为了突出显示加上的
                                }
                            },
                            axisLabel:{
                                show: true,
                                interval: 'auto',
                                formatter: '{value} MB'
                            }
                        },
                        {
                            name:"连接数（个）",
                            type: 'value',
                            axisLine:{
                                lineStyle:{
                                    color:'#fff',
                                    width:1,//  坐标轴宽度 这里是为了突出显示加上的
                                }
                            },
                            splitLine:{  // 去掉与坐标轴平行的直线
                                show:false
                            },
                            axisLabel:{
                                show: true,
                                interval: 'auto',
                                formatter: '{value} 个'
                            }
                        },
                        {
                            name:"占用空间（MB）",
                            type: 'value',
                            offset:80,
                            axisLine:{
                                lineStyle:{
                                    color:'#fff',
                                    width:1,//  坐标轴宽度 这里是为了突出显示加上的
                                }
                            },
                            splitLine:{  // 去掉与坐标轴平行的直线
                                show:false
                            },
                            axisLabel:{
                                show: true,
                                interval: 'auto',
                                formatter: '{value} MB'
                            },
                            // nameLocation:"middle",
                            // nameTextStyle:{
                            //     color:"red",
                            //     align:"right",
                            //     verticalAlign:"right"
                            // }
                        },
                    );
                    upDataBaseOption.series.push(
                        {
                            name:"内存",
                            type:'line',
                            data:data.MemoryData,
                            yAxisIndex:0,
                        },
                        {
                            name:"连接数",
                            type:'line',
                            data:data.ConnCount,
                            yAxisIndex:1,
                        },
                        {
                            name:"占用空间",
                            type:'line',
                            data:data.Size,
                            yAxisIndex:2,
                        }
                    );
                    _this[dom].setOption(upDataBaseOption,true);
                },
                error:function(err){
                    console.log(err);
                }
            })
        },
        // 获取数据库
        getBase:function(dom,id,arrName,i){
            i=i?i:0;
            var _this=this;
            this[arrName]=[];
            $.ajax({
                url:"http://172.31.10.153:6088/json/reply/SearchDataBaseManagementReq",
                type:"post",
                data:{
                    DataBaseIpAddress:id
                },
                success:function(data){
                    if(data.Infos.length>=1){
                        _this[arrName]=data.Infos;
                        _this[arrName+'Length']=_this[arrName].length;
                        if(dom==="upDataBase"){
                                _this.upDBName=data.Infos[0].DbName;
                                _this.upServerIdArrLength=data.Infos.length;
                        }else{
                            _this.downDBName=data.Infos[0].DbName;
                            _this.downServerIdArrLength=data.Infos.length;

                        }
                        _this.getDataBase(dom,data.Infos[0].SysNo);
                    }else{
                        if(dom==="upDataBase"){
                            _this.upServerIdArrLength=0;
                        }else{
                            _this.downServerIdArrLength=0;

                        }
                        _this[dom].setOption(nullOption,true);

                    }
                },
                error:function(err){
                    console.log(err);
                }
            })
        },
        // 获取服务器
        getServer:function(){
            var _this=this;
            $.ajax({
                url:"http://172.31.10.153:6088/json/reply/SearchSystemDashboardReq",
                type:"post",
                data:{
                    SystemType: 1001,
                    UserId: 2
                },
                success:function(data){
                    _this.oddNum=false;
                    // 服务器列表
                    if(data.Infos.length===1){
                        _this.upSystemIp=data.Infos[0].SystemIpAddress;
                        _this.upSystemName=data.Infos[0].SystemName;
                        _this.upWarning=data.Infos[0].Warning;
                        _this.getData("upServer",data.Infos[0].SysNo,"upDisk");
                        _this.getBase("upDataBase",data.Infos[0].SystemIpAddress,"upServerIdArr");
                    }
                    if(data.Infos.length>=2){
                        _this.upWarning=data.Infos[0].Warning;
                        _this.downWarning=data.Infos[1].Warning;
                        _this.upSystemIp=data.Infos[0].SystemIpAddress;
                        _this.downSystemIp=data.Infos[1].SystemIpAddress;
                        _this.upSystemName=data.Infos[0].SystemName;
                        _this.downSystemName=data.Infos[1].SystemName;
                        _this.showSystemNum=0;
                        _this.getData("upServer",data.Infos[0].SysNo,"upDisk");
                        _this.getData("downServer",data.Infos[1].SysNo,"downDisk");
                        _this.getBase("upDataBase",data.Infos[0].SystemIpAddress,"upServerIdArr");
                        _this.getBase("downDataBase",data.Infos[1].SystemIpAddress,"downServerIdArr");
                    }
                    if(data.Infos.length>=3 ){
                        if(data.Infos.length%2===0){
                            _this.SystemDBBase=data.Infos;
                        }else{
                            _this.oddNum=true;
                            _this.SystemDBBase=[...data.Infos,...data.Infos];
                        }
                        _this.SystemDBBaseLength=_this.SystemDBBase.length;
                    }


                },
                error:function(err){
                    console.log(err);
                }
            })
        },
        getData:function(dom,sysOn,disk){
            var _this=this;
           $.ajax({
               url:"http://172.31.10.153:6088/json/reply/SearchManageForChartReq",
               type:"post",
               data:{
                   ManageSysNo: sysOn
               },
               success:function(data){
                   var upServerOption=clone(option);
                   if(data.CreateTime.length===0){
                       _this[dom].setOption(nullOption,true);
                       return false;
                   }
                   upServerOption.xAxis.data=data.CreateTime;
                   upServerOption.yAxis.push(
                       {
                           name:"百分比（%）",
                           type: 'value',
                           axisLine:{
                               lineStyle:{
                                   color:'#fff',
                                   width:1,//  坐标轴宽度 这里是为了突出显示加上的
                               }
                           },
                           axisLabel:{
                               show: true,
                               interval: 'auto',
                               formatter: '{value} %'
                           }
                       }
                   );
                   upServerOption.series.push(
                       {
                           name:"CPU",
                           type:'line',
                           data:data.CpuData
                       },
                       {
                           name:"内存",
                           type:'line',
                           data:data.MemoryData
                       }
                   );
                   _this[disk]=[];
                   for(var i=0;i<data.DiskInfos.length;i++){
                       _this[disk].push(data.DiskInfos[i].DiskName);
                       upServerOption.series.push({
                           name:data.DiskInfos[i].DiskName,
                           type:'line',
                           data:data.DiskInfos[i].Disk
                       })
                   }
                   _this[dom].setOption(upServerOption,true);
               },
               error:function(err){
                   console.log(err)
               }
           });
       },
        getUnusual:function(refresh){
            var _this=this;
           $.ajax({
               url:"http://172.31.10.153:6088/json/reply/SearchWarningInfoReq",
               success:function(data){
                   let arr=data.Infos;
                   if(refresh){
                       _this.unusualTemp=[...arr,...arr];
                   }else{
                       _this.unusualFlag=true;
                       _this.unusualDom.style.marginTop="0px";
                       _this.scroll=0;
                       _this.unusual=[...arr,...arr];
                       _this.unusualLength=_this.unusual.length;
                   }
               },
               error:function(err){
                   console.log(err);
               }
           })
        }
    }
})