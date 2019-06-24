$(function () {
    var waterFall = new Vue({
        el: '#wrap',
        data: {
            pageData: {},
            dataList: [],
            loading: false,
            screenWidth: window.screen.width,
            timer: false
        },
        created: function () {
            this.init();
        },
        // 监听屏幕尺寸变化
        mounted() {
            const that = this;
            window.onresize = () => {
                return (() => {
                    window.screenWidth = window.screen.width;
                    that.screenWidth = window.screenWidth;
                })();
            }
        },
        methods: {
            // 初始化
            init: function () {
                
                this.dataList = [];
                this.pageData = { pageNumber: 1, pageSize: 10, totalPage: 3, dataDescription: "" };
                this.getData(this.pageData.pageNumber);
                window.onscroll = this.scroll;
            },
            // 请求数据
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
            // 滚动加载
            scroll: function () {
                //文档内容实际高度（包括超出视窗的溢出部分）
                var scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
                //滚动条滚动距离
                var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                //窗口可视范围高度
                var clientHeight = window.innerHeight || Math.min(document.documentElement.clientHeight, document.body.clientHeight);
                if (clientHeight + scrollTop >= scrollHeight) {
                    if (this.pageData.pageNumber < this.pageData.totalPage) {
                        this.loading = true;
                        this.pageData.pageNumber += 1;
                        this.getData(this.pageData.pageNumber);
                    } else {
                        waterFall.loading = false;
                    }
                }
            },
            // 瀑布流处理
            waterfall: function (elements) {
                if (elements.length < 1) {
                    return;
                }
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
            // 获取最小列索引
            getIndex: function (minHeight, everyHeight) {
                for (var index in everyHeight) {
                    if (everyHeight[index] == minHeight) {
                        return index;
                    }
                }
            },
            // 判断图片是否已加载
            imgLoading: function (callback) {
                var isloaded = true;
                var temTimeImg;
                $('.list-item').each(function () {
                    if ($($(this).find('img')[0]).height() === 0) {
                        isloaded = false;
                        return false;
                    }
                });
                if (isloaded) {
                    clearTimeout(temTimeImg);
                    callback();
                } else {
                    isloaded = true;
                    temTimeImg = setTimeout(function () {
                        waterFall.imgLoading(callback);
                    }, 500);
                }
            }
        },
        watch: {
            // 监听dataList数据变化，主要用于滑动加载下一页
            dataList: function () {
                this.$nextTick(function () {
                    if ($(waterFall.$el).find('.list-item').length < 1) {
                        return;
                    }
                    waterFall.imgLoading(function () {
                        waterFall.waterfall($(waterFall.$el).find('.list-item'));
                        var temHeight = $(waterFall.$el).find('.loadMore')[0].previousElementSibling.offsetTop + $(waterFall.$el).find('.loadMore')[0].previousElementSibling.offsetHeight + 'px';
                        $($(waterFall.$el).find('.loadMore')[0]).css({ 'position': 'absolute', 'top': temHeight });
                    });
                });
            },
            // 监听屏幕尺寸变化，并重新布局
            screenWidth(val) {
                if (!this.timer) {
                    this.screenWidth = val;
                    this.timer = true;
                    let that = this;
                    setTimeout(function () {
                        that.init();
                        that.timer = false;
                    }, 400);
                }
            }
        }
    });
});