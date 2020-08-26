<template>
  <div class="login_contaier">
    <div class="login_box">
      <!-- 头像 -->
      <div class="a_box">
        <img src="../assets/logo.png" />
      </div>
      <!-- 登陆表单区域 -->
      <el-form ref="formref" :model="loginFrom" :rules="rules" label-width="0px" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" v-model="loginFrom.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" type="password" v-model="loginFrom.password"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="loginvaild">登录</el-button>
          <el-button type="info" @click="resent">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loginFrom: {
        username: "admin",
        password: "123456"
      },
      // 表单验证规则
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],

        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6到 15 个字符", trigger: "blur" }
        ]
      }
      
    };
  },
  methods:{
    //   重置
      resent(){
        //   console.log(this.$refs.lormref);
          this.$refs.formref.resetFields();
      },
       //   登录按钮
        loginvaild(){
          this.$refs.formref.validate(async valid=>{
                 if(!valid) {
                     return ;
                 }
               const {data:result}=await  this.$http.post('login',this.loginFrom);
            //    console.log(result.meta);
            if(result.meta.status!==200) {
                return this.$msg.error('登陆失败');
            }
              this.$msg.success('登陆成功');
                window.sessionStorage.setItem('token',result.data.token)
                this.$router.push('/home')

          });      
        
          
          }
  }
};
</script>
<style lang="less" scoped>
.login_contaier {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  background-color: white;
  height: 300px;
  border-radius: 3px;
  // 正中间
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.a_box {
  widows: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  text-align: center;
  padding: 10px;
  box-shadow: 0 0 10px #add;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    widows: 100%;
    border-radius: 50%;
    background-color: #eee;
    height: 100%;
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>