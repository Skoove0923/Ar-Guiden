import request from '@/utils/request'
import { useUserStore } from '@/store/user'

interface LoginResponse {
  code: number;
  data: string;
  message?: string;
}

interface RegisterParams {
  username: string;
  password: string;
  email?: string;
}

interface UpdateUserParams {
  id: number;
  username: string;
  name?: string;
  email?: string;
  image?: string;
  file?: File;
  avatar?: File;
}

interface UpdatePasswordParams {
  id: number;
  password: string;
}

interface BindEmailParams {
  email: string;
  code: string;
}

interface UploadResponse {
  code: number;
  data: {
    url: string;  // OSS URL
    image: string; // 兼容后端返回格式
  };
  msg?: string;
}


// 添加环境变量类型声明
declare const process: {
    env: {
        UNI_PLATFORM: string;
    };
};


interface ChooseImageTempFile {
    path: string;
    size: number;
    type?: string;
    file?: File;
}

export default {
  login(username: string, password: string) {
    return request<LoginResponse>({
      url: '/user/login',
      method: 'post',
      data: { username, password }
    })
  },

  register(data: RegisterParams, file?: File) {
    const formData = new FormData()
    formData.append('username', data.username)
    formData.append('password', data.password)
    if (data.email) formData.append('email', data.email)
    if (file) formData.append('file', file)

    return request<LoginResponse>({
      url: '/user/register',
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
  },
  logout() {
    return request({
      url: '/user/logout',
      method: 'post'
    })
  },
  uploadAvatar(filePath: string, userId: number) {
    const userStore = useUserStore()
    return new Promise<UploadResponse>((resolve, reject) => {
        uni.chooseImage({
            count: 1,
            sourceType: ['album', 'camera'],
            success: async (chooseRes: UniApp.ChooseImageSuccessCallbackResult) => {
                try {
                    // 检查是否有选择文件
                    if (!chooseRes.tempFilePaths?.length) {
                        throw new Error('未选择文件')
                    }

                    // 在 H5 环境下
                    if (process.env.UNI_PLATFORM === 'h5') {
                        // 创建 FormData
                        const formData = new FormData()
                        formData.append('id', userId.toString())
                        formData.append('username', userStore.userInfo.username)
                        
                        // 获取文件对象
                        const tempFile = chooseRes.tempFiles?.[0] as ChooseImageTempFile
                        
                        // 如果有 file 属性，使用它
                        if (tempFile?.file) {
                            formData.append('file', tempFile.file)
                        } 
                        // 否则从 path 创建 File 对象
                        else if (tempFile?.path) {
                            const response = await fetch(tempFile.path)
                            const blob = await response.blob()
                            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
                            formData.append('file', file)
                        } else {
                            throw new Error('未获取到文件数据')
                        }

                        const res = await request({
                            url: '/user/updateUser',
                            method: 'put',
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            },
                            data: formData
                        })

                        if (res.data.code === 100200) {
                            resolve({
                                code: 100200,
                                data: {
                                    url: res.data.data,
                                    image: res.data.data
                                },
                                msg: '上传成功'
                            })
                        } else {
                            throw new Error(res.data.msg || '上传失败')
                        }
                    } else {
                        // 非 H5 环境
                        const res = await this.updateUser({
                            id: userId,
                            username: userStore.userInfo.username,
                            image: chooseRes.tempFilePaths[0]
                        })

                        if (res.data.code === 100200) {
                            resolve({
                                code: 100200,
                                data: {
                                    url: res.data.data,
                                    image: res.data.data
                                },
                                msg: '上传成功'
                            })
                        } else {
                            throw new Error(res.data.msg || '上传失败')
                        }
                    }
                } catch (error) {
                    console.error('上传失败:', error)
                    reject(error)
                }
            },
            fail: (error) => {
                reject(new Error('选择图片失败'))
            }
        })
    })
  },

  getUserInfo() {
    return request({
      url: '/user/getInfo',
      method: 'get',
    }).then(response => {
      const data = response.data;
      return data;
    });
  },

  getUserInfoByPath(userId: number) { 
    return request({
      url: `/user/getUserInfo/${userId}`,
      method: 'get'
    })
  },
  updateUser(data: UpdateUserParams) {
    const formData = new FormData()
    formData.append('id', data.id.toString())
    formData.append('username', data.username)
    if (data.name) formData.append('name', data.name)
    if (data.email) formData.append('email', data.email)
    if (data.image) formData.append('image', data.image)
    if (data.avatar) formData.append('avatar', data.avatar)

    return request({
      url: '/user/updateUser',
      method: 'put',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
  },

  updatePassword(data: UpdatePasswordParams) {
    return request({
      url: '/user/updateUser',
      method: 'put',
      data
    })
  },

  sendEmailCode(email: string) {
    return request({
      url: '/user/sendEmailCode',
      method: 'post',
      data: { email }
    })
  },

  bindEmail(data: BindEmailParams) {
    return request({
      url: '/user/bindEmail',
      method: 'post',
      data
    })
  }
} 