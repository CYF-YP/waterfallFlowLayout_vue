$(function () {
    var waterFall = new Vue({
        el: '#wrap',
        data: {
            pageData: {},
            dataList: [],
            loading: false
        },
        created: function () {
            this.init();
        },
        methods: {
            init: function () {
                this.pageData = { pageNumber: 1, pageSize: 10, totalPage: 3, dataDescription: "" };
                this.getData(this.pageData.pageNumber);
                window.onscroll = this.scroll;
            },
            getData: function (pageNumber) {
                $.ajax({
                    url: "https://api.apiopen.top/musicBroadcasting",
                    type: 'GET',
                    dataType: "json",
                    data: {},
                    success: function (data) {
                        // 数据格式:[{src:xxx, href:xxx, name:xxx},{src:xxx, href:xxx, name:xxx}]
                        if (pageNumber == 1) {
                            for (x in data.result[0].channellist) {
                                data.result[0].channellist[x].src = data.result[0].channellist[x].thumb;
                                data.result[0].channellist[x].href = "www.baidu.com";
                                data.result[0].channellist[x].name = data.result[0].channellist[x].name;
                            }
                            waterFall.dataList = waterFall.dataList.concat(data.result[0].channellist);
                        } else {
                            for (x in data.result[1].channellist) {
                                data.result[1].channellist[x].src = data.result[1].channellist[x].avatar;
                                data.result[1].channellist[x].href = "www.baidu.com";
                                data.result[1].channellist[x].name = data.result[1].channellist[x].name;
                            }
                            waterFall.dataList = waterFall.dataList.concat(data.result[1].channellist);
                        }
                    }
                });
            },
            scroll: function () {
                // 文档内容实际高度(包含超出视窗的部分)
                var scrollHeight = Math.max($(document).height(), $(document.body).height());
                // 滚动条滚动的距离
                var scrollTop = $(window).scrollTop();
                // 窗口可视范围高度
                var clientHeight = $(window).height();
                if (clientHeight + scrollTop >= scrollHeight) {
                    if (this.pageData.pageNumber < this.pageData.totalPage) {
                        this.loading = true;
                        this.pageData.pageNumber += 1;
                        this.getData(this.pageData.pageNumber);
                    } else {
                        this.loading = false;
                    }
                }
            },
            waterfall: function (elements) {
                var boxes = elements;
                var boxWidth = boxes[0].offsetWidth + 20;
                var windowWidth = $(document).width();
                var colsNumber = Math.floor(windowWidth / boxWidth);

                this.$el.style.width = boxWidth * colsNumber + 'px';

                var everyHeight = new Array();
                for (var i = 0; i < boxes.length; i++) {
                    if (i < colsNumber) {
                        everyHeight[i] = boxes[i].offsetHeight + 20;
                    } else {
                        var minHeight = Math.min.apply(null, everyHeight);
                        var minIndex = this.getIndex(minHeight, everyHeight);
                        var leftValue = boxes[minIndex].offsetLeft - 10;
                        boxes[i].style.position = 'absolute';
                        boxes[i].style.top = minHeight + 'px';
                        boxes[i].style.left = leftValue + 'px';
                        everyHeight[minIndex] += boxes[i].offsetHeight + 20;
                    }
                }
            },
            getIndex: function (minHeight, everyHeight) {
                for (var index in everyHeight) {
                    if (everyHeight[index] == minHeight) {
                        return index;
                    }
                }
            },
            imgLoading: function (callback) {
                var isloaded = true;
                var temTimeImg;
                $('.list-item').each(function(){
                    if ($(this).find('img').height === 0) {
                        isloaded = false;
                        return false;
                    }
                });
                if(isloaded){
                    clearTimeout(temTimeImg);
                    callback();
                }else{
                    isloaded = true;
                    temTimeImg = setTimeout(function(){
                        waterFall.imgLoading(callback);
                    },500);
                }
            }
        },
        watch: {
            dataList: function () {
                this.$nextTick(function () {
                    waterFall.imgLoading(function(){
                        waterFall.waterfall($(waterFall.$el).find('.list-item'));
                    });
                });
            }
        }
    });
});


// 写到处理图片了,但同时滚动至底部出了问题