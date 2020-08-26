<template>
    <div>
        <!-- 面包屑,导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item></el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
         <el-alert
    title="添加商品信息"
    type="info"
    center
    show-icon
    :closable="false">
  </el-alert>
  <!-- 步骤条 -->
  <el-steps :space="200" :active="activeindex-0" finish-status="success" align-center >
  <el-step title="基本信息"></el-step>
  <el-step title="商品参数"></el-step>
  <el-step title="商品属性"></el-step>
  <el-step title="商品图片"></el-step>
  <el-step title="商品内容"></el-step>
  <el-step title="完成"></el-step>
</el-steps>
<!-- tab栏区域 -->
<el-form :model="addfrom" :rules="addfromrules" ref="addfromref" label-width="100px" label-position="top">
<el-tabs v-model="activeindex" :tab-position="'left'" :before-leave="beforetableave" @tab-click="tabclick"
>
    <el-tab-pane label="基本信息" name="0">
        <el-form-item label="商品名称"  prop="goods_name">
             <el-input v-model="addfrom.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格"  prop="goods_price">
             <el-input v-model="addfrom.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量"  prop="goods_weight">
             <el-input v-model="addfrom.goods_weight"></el-input>
        </el-form-item>
        <el-form-item label="商品数量"  prop="goods_number">
             <el-input v-model="addfrom.goods_number"></el-input>
        </el-form-item>
         <el-form-item label="商品分类"  >
             <el-cascader
    v-model="addfrom.goods_cat"
    :options="catelist"
    :props="cateprops"
    @change="handleChange">
    </el-cascader>
        </el-form-item>
         
        </el-tab-pane>
    <el-tab-pane label="商品参数"  name="1">
       <el-form-item :label="item.attr_name" v-for="item in manytabledata" :key="item.attr_id">
          <!-- 复选框 -->
           <el-checkbox-group v-model="item.attr_vals">
             <el-checkbox border :label="cb" v-for="(cb,i2) in item.attr_vals" :key="i2"></el-checkbox>
           </el-checkbox-group>
       </el-form-item>
        </el-tab-pane>
    <el-tab-pane label="商品属性"  name="2">
        <el-form-item :label="item.attr_name" v-for=" item in onletabledata" :key="item.attr_id">
            <el-input v-model="item.attr_vals" placeholder=""></el-input>
        </el-form-item>
        </el-tab-pane>
    <el-tab-pane label="商品图片"  name="3">
        <el-upload
        :headers="headersobj"
  :action="imgurl"
  :on-preview="handlePreview"
  :on-remove="handleRemove"
  :on-success="handlesuccess"
  list-type="picture">
  <el-button size="small" type="primary">点击上传</el-button>
  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
</el-upload>
        </el-tab-pane>
    <el-tab-pane label="商品内容"  name="4">
        <!-- 富文本 -->
        <quill-editor 
        v-model="addfrom.goods_introduce"
        >
        </quill-editor>
        <el-button type="primary" @click="addsp">添加商品</el-button>
        </el-tab-pane>
  </el-tabs>
</el-form>
    </el-card>
    <el-dialog
  title="图片预览"
  :visible.sync="dialogVisible"
  width="50%">
  <img :src="prviewpath" alt="" class="dialogVisible">
</el-dialog>
    </div>
</template>
<script>
import _ from 'lodash'
export default {
    data(){
        return{
            //步骤条的起始位置控制索引
            activeindex:'0',
            addfrom:{
                goods_name:'',
                goods_price:0,
                goods_weight:0,
                goods_number:0,
                goods_cat:[],
                pics:[],
                // 商品详情
                goods_introduce:'',
                attrs:[]

            },
            addfromrules:{
                goods_name:[{required: true, message:'请输入商品名称', trigger: 'blur'}],
                goods_price:[{required: true, message:'请输入商品价格', trigger: 'blur'}],
                goods_weight:[{required: true, message:'请输入商品重量', trigger: 'blur'}],
                goods_number:[{required: true, message:'请输入商品数量', trigger: 'blur'}],
                goods_cat:[{required: true, message:'请选择商品分类', trigger: 'blur'}],

      },
        // 存放分类数据列表
        catelist:[],
        cateprops:
            { 
                label:'cat_name',
                value:'cat_id',
                expandTrigger: 'hover'
                 },
        selectopp:[],
        manytabledata:[],
        onletabledata:[],
        imgurl:'http://47.115.124.102:8888/api/private/v1/upload',
        headersobj:{
            Authorization:window.sessionStorage.getItem('token')
        },
        prviewpath:'',
        dialogVisible:false
    }     
    },
    methods:{
       async getcatelist(){
         const {data:res}=await  this.$http.get('categories')
         if (res.meta.status !== 200) {
        return this.$msg.error("获取分类数据失败");
      }
      this.catelist=res.data
       },
    //    商品分类选中变化事件
       handleChange(){
        if(this.addfrom.goods_cat.length!=3){
            this.addfrom.goods_cat=[]
        }
       },
    //    监听tabs的跳转，
       beforetableave(activename,oldactivename){
        //    console.log(activename);
        //    console.log(oldactivename);
        if(oldactivename=='0'&&this.addfrom.goods_cat.length!=3)
        {
            this.$msg.error('请选择商品分类')
            return false
        }

           
       },
    //    tab单机事件
      async tabclick(){
        //    动态参数面板
           if(this.activeindex=='1'){
           const {data:res}=  await  this.$http.get(`categories/${this.careid}/attributes`,{params:{sel:'many'}})
            if(res.meta.status!==200){
                return this.$msg.error('获取商品属性失败')
            }
            res.data.forEach(item=>{
              item.attr_vals=  item.attr_vals.length==0?[]:item.attr_vals.split(',')
               
           })
            console.log(res.data);
            
            this.manytabledata=res.data
          }
          else if(this.activeindex=='2'){
               const {data:res}=  await  this.$http.get(`categories/${this.careid}/attributes`,{params:{sel:'only'}})
            if(res.meta.status!==200){
                return this.$msg.error('获取商品属性失败')
            }
        //     res.data.forEach(item=>{
        //       item.attr_vals=  item.attr_vals.length==0?[]:item.attr_vals.split(',')
               
        //    })
        //     console.log(res.data);
            
            this.onletabledata=res.data
          }
       },
    //    图片预览事件
       handlePreview(file){
           this.prviewpath=file.response.data.url
           this.dialogVisible=true;
       },
    //    处理移出图片的操作
    // 要移除的图片信息
       handleRemove(file){
        const filepath=file.response.data.tmp_path
        const i=this.addfrom.pics.findIndex(x=>
            x.pic==filepath
        )
        this.addfrom.pic.splice(i,1)
       },
    //    监听图片上传成功
    // 服务器返回的信息
       handlesuccess(response){
            const picinfo={pic:response.data.tmp_path}
            this.addfrom.pics.push(picinfo)
     },
    //  添加商品
    addsp(){
        this.$refs.addfromref.validate(async val=>{
            if(!val){
                return this.$msg.error('请添加商品信息')
            }
            //lodash  cloneDeep(obj)
            const form=_.cloneDeep(this.addfrom)
            form.goods_cat= form.goods_cat.join(',')
            //动态参数
            this.manytabledata.forEach(item=>{
                const newinfo={
                    attr_id:item.attr_id,
                    attr_value:item.attr_vals.join(' ')
                }
                this.addfrom.attrs.push(newinfo)
            })
            //静态属性
             this.onletabledata.forEach(item=>{
                const newinfo={
                    attr_id:item.attr_id,
                    attr_value:item.attr_vals
                }
                this.addfrom.attrs.push(newinfo)
            })
            form.attrs=this.addfrom.attrs
          const {data:res} =await this.$http.post('goods',form)
            if(res.meta.status!==201){
                return this.$msg.error('添加商品失败(接口的问题)')
            }
            this.$msg.success('添加商品成功')
            this.$router.push('/goods')
        })
    }
    },
    created(){
        this.getcatelist()

    },
    computed:{
        careid(){
            if(this.addfrom.goods_cat.length===3){
                return this.addfrom.goods_cat[2]
            }
            return null
        }
    },
}
</script>
<style lang="less" scoped>
.el-steps{
    margin: 15px 10px;
   
}
.el-step__title{
     font-size:13px ;
     color: white;
}
.el-checkbox{
    margin:  0 10px 0 0 !important;
}
.dialogVisible{
    width: 100%;
}
</style>