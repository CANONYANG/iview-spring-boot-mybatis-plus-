/**
 * Created by CANONYANG on 2018/7/14.
 */

//腾讯云文件服务器地址
export function COS_IMAGE_URL(){
    return 'https://token-up-1257006810.cos.ap-beijing.myqcloud.com/';
}

export function COS_VIDEO_URL() {
    return 'https://token-up-video-1257006810.cos.ap-beijing.myqcloud.com/';
}

//图片工具类
export function returnImageUrl(url){
    var avatar = '';
    var imgUrl = url+'';
    if( imgUrl.match(/https/g) === null && imgUrl.match(/http/g) === null){
        avatar = COS_IMAGE_URL() + imgUrl;
    }else {
        avatar = imgUrl;
    }
    return avatar;
}