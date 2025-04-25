import request from '@/utils/request'
export default {
    getQuestionsList(level: number) {
        return request({
            url: '/questions/questions',
            method: 'post',
            data: {
                level
            }
        })
    }
}
