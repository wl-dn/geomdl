/*
 * @Descripttion: 绘制类
 * @Author: wenlong
 * @version: 
 * @Date: 2021-08-23 14:46:59
 * @LastEditors: wenlong
 * @LastEditTime: 2021-08-24 21:28:38
 */
import * as Cesium from "cesium"
export default class DrawUtils {
    constructor(_viewer) {
        this._viewer = _viewer;
        this._excavateMinHeight = 9999 //最低挖掘海拔值
    }
    /**
     * @descripttion: 绘制点的entity
     * @param {*} position
     * @param {*} config
     * @return {*} pointGeometry
     */
    drawPointEntity(position, config) {
        config = config || {};
        let pointGeometry = this._viewer.entities.add({
            name:"绘制点",
            position: position,
            point: {
                color: Cesium.Color.SKYBLUE,
                pixelSize: 5,
                outlineColor: Cesium.Color.YELLOW,
                outlineWidth: 3,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                // color: Cesium.Color.WHITE,
                // pixelSize: 5,
                // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }
        })
        return pointGeometry
    }
    /**
     * @descripttion: 绘制线entity
     * @param {*} positionLine
     * @param {*} config
     * @return {*}
     */
    drawPolyLineEntity(positionLine, config) {
        if (positionLine.length < 1) return;
        config = config || {};
        let polylineGeometry = this._viewer.entities.add({
            name:"绘制线",
            polyline: {
                positions: positionLine,
                width: config.width ? config.width : 5.0,
                clampToGround: true,
                material: new Cesium.PolylineGlowMaterialProperty({
                    color: config.color ? new Cesium.Color.fromCssColorString(config.color) : Cesium.Color.GOLD,
                }),
                depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({
                    color: config.color ? new Cesium.Color.fromCssColorString(config.color) : Cesium.Color.GOLD,
                }),
            }
        });
        return polylineGeometry;
    }
    /**
     * @descripttion: 绘制面entity
     * @param {*} positionPloygon
     * @param {*} config
     * @return {*}
     */
    drawPolygonEntity(positionPolygon, config) {
        if (positionPolygon.length < 2) return;
        config = config || {};
        let polygonGeometry = this._viewer.entities.add({
            polygon: {
                // height: 0.1,
                // hierarchy: new Cesium.PolygonHierarchy(positionPolygon),
                // hierarchy: positionPolygon,
                //material: config.color ? new Cesium.Color.fromCssColorString(config.color).withAlpha(.2) : new Cesium.Color.fromCssColorString("#FFD700").withAlpha(.9),
                // perPositionHeight: true,
                // outline: true,
                // 想设置outline，必须要有高度
                // outlineWidth: 1
                hierarchy: positionPolygon,
                material: new Cesium.ColorMaterialProperty(
                    Cesium.Color.WHITE.withAlpha(0.7)
                ),
            }
        });
        return polygonGeometry;
    }
    /**
     * @descripttion: 获取根据id绘制多边形的数据
     * @param {*} pointsList
     * @return {*}
     */
    getPolygonListById(id, listData) {
        listData = listData || {};
        const entity = this._viewer.entities.getById(id);
        if (entity) {
            listData.positionData = entity.polygon.hierarchy['_value'].positions;
            listData.name = entity.name;
            return listData
        } else {
            return null;
        }
    }
    getPolygonDataByEntity(entity) {
        let listData = {};
        if (entity) {
            listData.positionData = entity.polygon.hierarchy['_value'].positions;
            listData.name = entity.name;
            return listData
        }
        else {
            return null;
        }
    }

    getEntitiesByName(name){
        let entitiesCollect = this._viewer.entities.values;
        let tempEntites = [];
        for(let i=0;i<entitiesCollect.length;i++) {
            if(entitiesCollect[i].name === name) {
                tempEntites.push(entitiesCollect[i])
            }
        }
        return tempEntites
    }
 




    /**
     * @descripttion:地形挖掘，返回挖掘的实体entity
     * @param {*}  
     * points:挖掘面点数据[Cartesian3]
     * options:{
     *      bottomMaterial:底部材料图片
     *      wallMaterial：井面材质图片
     *      height: 挖掘深度
     *      lerpInterval:"没两点之间的差值个数"
     *      excavateMinHeight：最低挖掘海拔值
     *      minHeight：99999
     * 
     * }
     * @return {*}
     */
    drawTerrianDig(points, options = {}) {
        // 开启highDynamicRangeSupported
        if (points.length < 3 || options.lerpInterval < 0) return;
        // 构建裁剪面
        this._createClipTerrian(points);
        //获取最低点高度
        options.minHeight = this._getMinPointHeight(points, options.height)
        //创建井底部
        this._createBottomSurface(points, options.bottomMaterial, options.minHeight)

        //创建井壁
        this._createShaftWall(points, options.bottomMaterial, options.minHeight, options.lerpInterval)

    }
    // 构建裁剪面
    _createClipTerrian(points) {
        // 判断点的顺序是顺时针还是逆时针
        const isRight = this._judgeDirection(points);
        const tempLength = points.length;
        let clippingPlanes = [];
        for (let i = 0; i < tempLength; ++i) {
            const nextIndex = (i + 1) % tempLength

            // up指标准化后的一个Cartesian3坐标
            let up = Cesium.Cartesian3.normalize(points[i], new Cesium.Cartesian3())
            // right是一个向量，通过subtract相减两个坐标点
            let right = !isRight
                ? Cesium.Cartesian3.subtract(points[i], points[nextIndex], new Cesium.Cartesian3())
                : Cesium.Cartesian3.subtract(points[nextIndex], points[i], new Cesium.Cartesian3())
            // 向量标准化处理
            right = Cesium.Cartesian3.normalize(right, right)

            // 叉乘得到对应裁剪平面的法向量
            let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3())
            normal = Cesium.Cartesian3.normalize(normal, normal)
            clippingPlanes.push(new Cesium.ClippingPlane(normal, 0))
        }
        //创建地形裁剪
        this._viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes: clippingPlanes,
            edgeWidth: 1,
            edgeColor: Cesium.Color.WHITE
        })
    }
    // 构建井底
    _createBottomSurface(points, bottomMaterial, minHeight) {
        const material = new Cesium.ImageMaterialProperty({
            image: bottomMaterial,
            repeat: new Cesium.Cartesian2(5, 5)
        })
        const bottomSurface = new Cesium.Entity({
            polygon: {
                hierarchy: new Cesium.PolygonHierarchy(points),
                height: minHeight,
                material
            }
        })

        this._viewer.entities.add(bottomSurface)
    }
    // 构建井壁
    _createShaftWall(points, wallMaterial, minHeight, lerpInter) {
        let lerpInterval = lerpInter,
            len = points.length,
            lerpPositions = []

        for (let i = 0; i < len; i++) {
            let nextIndex = (i + 1) % len
            let currRad = Cesium.Cartographic.fromCartesian(points[i])
            let nextRad = Cesium.Cartographic.fromCartesian(points[nextIndex])
            let position1 = [currRad.longitude, currRad.latitude]
            let position2 = [nextRad.longitude, nextRad.latitude]

            for (let j = 0; j < lerpInterval; j++) {
                // 经纬度设置插值
                let longitude = Cesium.Math.lerp(position1[0], position2[0], j / lerpInterval),
                    latitude = Cesium.Math.lerp(position1[1], position2[1], j / lerpInterval)
                lerpPositions.push(new Cesium.Cartographic(longitude, latitude))
            }
        }
        //增加开始点构造闭合环
        lerpPositions.push(lerpPositions[0].clone())
        this._createWellWall(lerpPositions, wallMaterial, minHeight)
    }
    // 构建墙体
    async _createWellWall(lerpPositions, wallMaterial, minHeight) {
        let wellPositions = [],
            maximumHeights = [],
            minimumHeights = []

        //根据采样地形高度更新坐标
        // 不更新的话，高度一般都是0
        // console.log(lerpPositions);
        await Cesium.sampleTerrainMostDetailed(this._viewer.terrainProvider, lerpPositions)

        lerpPositions.forEach(lerpPosition => {
            const { longitude, latitude, height } = lerpPosition

            wellPositions.push(Cesium.Cartesian3.fromRadians(longitude, latitude, height))
            maximumHeights.push(height)
            minimumHeights.push(minHeight)
        })

        const material = new Cesium.ImageMaterialProperty({
            image: wallMaterial,
            repeat: new Cesium.Cartesian2(5, 5)
        })

        let wallEntity = new Cesium.Entity({
            wall: new Cesium.WallGraphics({
                positions: wellPositions,
                maximumHeights,
                minimumHeights,
                material
            })
        })
        this._viewer.entities.add(wallEntity)
    }
    /**
     * @descripttion: 判断点的顺势是顺时针还是逆时针
     * @param {*} points
     * @return {*} true or false
     */
    _judgeDirection(points) {
        let lonlat1 = Cesium.Cartographic.fromCartesian(points[0])
        let lonlat2 = Cesium.Cartographic.fromCartesian(points[1])
        let lonlat3 = Cesium.Cartographic.fromCartesian(points[2])
        let x1 = lonlat1.longitude,
            y1 = lonlat1.latitude,
            x2 = lonlat2.longitude,
            y2 = lonlat2.latitude,
            x3 = lonlat3.longitude,
            y3 = lonlat3.latitude,
            dirRes = (x2 - x1) * (y3 - y2) - (y2 - y1) * (x3 - x2)

        let isR = dirRes > 0
        return isR
    }
    _getMinPointHeight(points, height) {
        this._excavateMinHeight = 9999;
        points.forEach(point => {
            const Cartographic = Cesium.Cartographic.fromCartesian(point)
            if (Cartographic.height < this._excavateMinHeight) {
                this._excavateMinHeight = Cartographic.height
            }
        })

        //找出最低点的高度
        return this._excavateMinHeight - height;
        // this._targetHeight = this._excavateMinHeight - this._height
        // this.minHeight = this._targetHeight
    }

    // 测量距离
    measureLine() {
        let handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
        let activeShapePoints = [];
        let activeShape;
        let floatingPoint;
        let distance = 0;
        handler.setInputAction((movement) => {
            let earthPosition = this._viewer.scene.pickPosition(movement.position);
            if (Cesium.defined(earthPosition)) {
                if (activeShapePoints.length === 0) {
                    floatingPoint = this.drawPointEntity(earthPosition);
                    activeShapePoints.push(earthPosition);
                    let dynamicPositions = new Cesium.CallbackProperty(function () {
                        return activeShapePoints;
                    }, false);
                    activeShape = this.drawPolyLineEntity(dynamicPositions);  // 绘制线
                }
                activeShapePoints.push(earthPosition);
                // this.drawPointEntity(earthPosition);
                let textDisance = distance + "米";
                this._viewer.entities.add({
                    name: '绘制点',
                    position: activeShapePoints[activeShapePoints.length - 1],
                    point: {
                        pixelSize: 5,
                        color: Cesium.Color.RED,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 2,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    },
                    label: {
                        text: textDisance,
                        font: '18px sans-serif',
                        fillColor: Cesium.Color.GOLD,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth: 2,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(20, -20),
                    }
                });
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction((movement) => {
            if (Cesium.defined(floatingPoint)) {
                let newPosition = this._viewer.scene.pickPosition(movement.endPosition);
                if (Cesium.defined(newPosition)) {
                    // floatingPoint.position.setValue(newPosition);
                    activeShapePoints.pop();
                    activeShapePoints.push(newPosition);
                    distance = this.getSpaceDistance(activeShapePoints);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction((movement) => {
            handler.destroy(); //关闭事件句柄
            handler = undefined;
            activeShapePoints.pop();
            this.drawPolyLineEntity(activeShapePoints);
            console.log(this._viewer.entities);
            // this._viewer.entities.remove(floatingPoint);
            // this._viewer.entities.remove(activeShape);
            floatingPoint = undefined;
            activeShape = undefined;
            activeShapePoints = [];
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);


    }
    // 测量面积
    measurePloygon() {
        let handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
        let activeShapePoints = [];
        let activeShape;
        let floatingPoint;
        handler.setInputAction((movement) => {
            let earthPosition = this._viewer.scene.pickPosition(movement.position);
            if (Cesium.defined(earthPosition)) {
                if (activeShapePoints.length === 0) {
                    floatingPoint = this.drawPointEntity(earthPosition);
                    activeShapePoints.push(earthPosition);
                    let dynamicPositions = new Cesium.CallbackProperty(function () {
                        return new Cesium.PolygonHierarchy(activeShapePoints);
                    }, false);
                    activeShape = this.drawPolygonEntity(dynamicPositions);
                }
                activeShapePoints.push(earthPosition);
                this.drawPointEntity(earthPosition);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction((movement) => {
            if (Cesium.defined(floatingPoint)) {
                let newPosition = this._viewer.scene.pickPosition(movement.endPosition);
                if (Cesium.defined(newPosition)) {
                    floatingPoint.position.setValue(newPosition);
                    activeShapePoints.pop();
                    activeShapePoints.push(newPosition);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction((movement) => {
            handler.destroy(); //关闭事件句柄
            handler = undefined;
            activeShapePoints.pop();
            this.drawPolygonEntity(activeShapePoints);
            this._viewer.entities.remove(floatingPoint);
            this._viewer.entities.remove(activeShape);
            floatingPoint = undefined;
            activeShape = undefined;
            activeShapePoints = [];
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    // 删除测量用的entity
    removeMeasureEntites() {
        // 删除点
        debugger
        let pointEntites = this.getEntitiesByName('绘制点');
        for(let i= 0;i<pointEntites.length;i++) {
            this._viewer.entities.remove(pointEntites[i])
        }
         // 删除点
         let lineEntites = this.getEntitiesByName('绘制线');
         for(let i= 0;i<lineEntites.length;i++) {
             this._viewer.entities.remove(lineEntites[i])
         }
    }
    _terminateShape() {
        activeShapePoints.pop();
        this.drawPolyLineEntity(activeShapePoints);
        this._viewer.entities.remove(floatingPoint);
        this._viewer.entities.remove(activeShape);
        floatingPoint = undefined;
        activeShape = undefined;
        activeShapePoints = [];
    }
    //空间两点距离计算函数
    getSpaceDistance(positions) {

        //只计算最后一截，与前面累加
        //因move和鼠标左击事件，最后两个点坐标重复
        // let i = positions.length - 3;
        // let point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
        // let point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
        // getTerrainDistance(point1cartographic, point2cartographic);

        let distance = 0;
        for (let i = 0; i < positions.length - 1; i++) {

            let point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
            let point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
            /**根据经纬度计算出距离**/
            let geodesic = new Cesium.EllipsoidGeodesic();
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            let s = geodesic.surfaceDistance;
            //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
            //返回两点之间的距离
            s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
            distance = distance + s;
        }
        return distance.toFixed(2);
    }

    getTerrainDistance(point1cartographic, point2cartographic) {
        let geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        let s = geodesic.surfaceDistance;
        let cartoPts = [point1cartographic];
        for (let jj = 1000; jj < s; jj += 1000) {　　//分段采样计算距离
            let cartoPt = geodesic.interpolateUsingSurfaceDistance(jj);
            cartoPts.push(cartoPt);
        }
        cartoPts.push(point2cartographic);
        //返回两点之间的距离
        let promise = Cesium.sampleTerrain(this._viewer.terrainProvider, 8, cartoPts);
        Cesium.when(promise, function (updatedPositions) {
            for (let jj = 0; jj < updatedPositions.length - 1; jj++) {
                let geoD = new Cesium.EllipsoidGeodesic();
                geoD.setEndPoints(updatedPositions[jj], updatedPositions[jj + 1]);
                let innerS = geoD.surfaceDistance;
                innerS = Math.sqrt(Math.pow(innerS, 2) + Math.pow(updatedPositions[jj + 1].height - updatedPositions[jj].height, 2));
                distance += innerS;
            }
            //在三维场景中添加Label
            let lon1 = this._viewer.scene.globe.ellipsoid.cartesianToCartographic(labelPt).longitude;
            let lat1 = this._viewer.scene.globe.ellipsoid.cartesianToCartographic(labelPt).latitude;
            let lonLat = "(" + Cesium.Math.toDegrees(lon1).toFixed(2) + "," + Cesium.Math.toDegrees(lat1).toFixed(2) + ")";
            let textDisance = distance.toFixed(2) + "米";
            if (distance > 10000)
                textDisance = (distance / 1000.0).toFixed(2) + "千米";
            floatingPoint = this._viewer.entities.add({
                name: '贴地距离',
                position: labelPt,
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                },
                label: {
                    text: lonLat + textDisance,
                    font: '18px sans-serif',
                    fillColor: Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(20, -20),
                }
            });
        });
    }
}