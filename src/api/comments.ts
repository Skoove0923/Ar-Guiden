import request from '@/utils/request'

export default {
    editComment(data: any) {
        return request({
            url: '/comments/update',
            method: 'post',
            data
        })
    },

    addComment(data: any) {
        return request({
            url: '/comments/add',
            method: 'post',
            data
        })
    },
    delComment(id: number) {
        return request({
            url: `/comments/delete/${id}`,
            method: 'delete',
            
        })
    },
    getComentsByUserId(userId: number) {
        return request({
            url: '/comments/get',
            method: 'post',
            data: {
                userId
            }
        })
    }
}
