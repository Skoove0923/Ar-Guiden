import request from '@/utils/request'
import { useUserStore } from '@/store/user'

interface NewsUpdateData {
  id: number;
  likes?: number;
  content?: string;
  summary?: string;
  image1?: string;
  image2?: string;
  image3?: string;
}

export default {
    getNewsList() {
        return request({
            url: '/news/list',
            method: 'get'
        }).then(response => {
            const data = response.data;
            return data;
        });
    },
    
    getNewsDetail(id: number) {
        return request({
            url: '/news/get',
            method: 'post',
            data: {id}
        }).then(response => {
            const data = response.data;
            return data;
        });
    },

    getComment(newsId: number) {
        return request({
            url: '/comments/get',
            method: 'post',
            data: {newsId}
        }).then(response => {
            const data = response.data;
            return data;
        });
    },
    uploadFiles(file: File, file1: File, file2: File) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('file1', file1);
        formData.append('file2', file2);

        return request({
            url: '/news/upload',
            method: 'post',
            data: formData
        }).then(response => {
            const data = response.data;
            return data;
        });
    },

    updateNewsContentI(data: NewsUpdateData) {
        // 创建 FormData 对象
        const formData = new FormData()
        
        // 添加数据到 FormData
        formData.append('id', String(data.id))
        if (data.likes !== undefined) {
            formData.append('likes', String(data.likes))
        }
        if (data.content) {
            formData.append('content', data.content)
        }
        if (data.summary) {
            formData.append('summary', data.summary)
        }
        if (data.image1) {
            formData.append('file', data.image1)
        }
        if (data.image2) {
            formData.append('file1', data.image2)
        }
        if (data.image3) {
            formData.append('file2', data.image3)
        }

        return request({
            url: '/news/update',
            method: 'put',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: formData
        })
    },

    // 获取点赞状态
    getLikeStatus(newsId: number): boolean {
        const userStore = useUserStore()
        const userId = userStore.userInfo.id
        const likeStatus = uni.getStorageSync('newsLikes') || {}
        return !!likeStatus[`${userId}_${newsId}`]
    },

    // 设置点赞状态
    setLikeStatus(newsId: number, status: boolean) {
        const userStore = useUserStore()
        const userId = userStore.userInfo.id
        const likeStatus = uni.getStorageSync('newsLikes') || {}
        likeStatus[`${userId}_${newsId}`] = status
        uni.setStorageSync('newsLikes', likeStatus)
    },

    // 更新评论点赞数
    updateCommentLikes(commentId: number, likes: number) {
        return request({
            url: '/comments/update',
            method: 'put',
            data: {
                id: commentId,
                likes
            }
        })
    },

    // 获取评论点赞状态
    getCommentLikeStatus(commentId: number): boolean {
        const userStore = useUserStore()
        const userId = userStore.userInfo.id
        const likeStatus = uni.getStorageSync('commentLikes') || {}
        return !!likeStatus[`${userId}_${commentId}`]
    },

    // 设置评论点赞状态
    setCommentLikeStatus(commentId: number, status: boolean) {
        const userStore = useUserStore()
        const userId = userStore.userInfo.id
        const likeStatus = uni.getStorageSync('commentLikes') || {}
        likeStatus[`${userId}_${commentId}`] = status
        uni.setStorageSync('commentLikes', likeStatus)
    }
} 
