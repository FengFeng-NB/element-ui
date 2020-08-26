<template>
  <el-container class="home-con">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>  
      <!-- 侧边栏 -->
      <el-aside :width="iscollapse?'64px':'200px'">
          <div class="toggle-button" @click="togglebtn">
              |||
          </div>
        <!-- 侧边栏菜单区域 -->
        <el-menu :default-active="activepath" 
        :router="true" 
        :collapse-transition="false" 
        :collapse="iscollapse" 
        :unique-opened="true" 
        background-color="#333744" 
        text-color="#fff" 
        active-text-color="#ffd04b">
          <!-- 1级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- 模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconlist[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+sunbitem.path" v-for="sunbitem in item.children" :key="sunbitem.id" @click="saveNavState('/'+sunbitem.path)">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{sunbitem.authName}}</span>
              </template>
            </el-menu-item>
            <el-menu-item index="/test">layout</el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主题 -->
      <el-main>
          <!-- 路由赞为辐 -->
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
    data(){
        return{
            menulist:[],
            iconlist:{
                '125':'el-icon-user-solid',
                '103':'el-icon-s-help',
                '101':'el-icon-shopping-cart-full',
                '102':'el-icon-document',
                '145':'el-icon-s-data',
            },
            iscollapse:false,
            activepath:[],
        }
    },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // 保存当前路径
    saveNavState(path){
        window.sessionStorage.setItem("acticepath",path)
        this.activepath=path
    },
    // 获取所有菜单
  async  getMenulist(){
     const {data :res}=  await this.$http.get('menus') 
     if(res.meta.status !==200) return this.$msg.error(res.meta.msg);
     this.menulist=res.data
     console.log(res);
     
    },
    // 点击按钮切换菜单的折叠与展开
    togglebtn(){
            this.iscollapse=!this.iscollapse
    }
  },
  created(){
    this.getMenulist()
    this.activepath=window.sessionStorage.getItem('acticepath')
  },
};
</script>
<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0px;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
  img {
    width: 50px;
    height: 50px;
  }
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.home-con {
  height: 100%;
}
.toggle-button{
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: white;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
</style>