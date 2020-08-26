<template>
  <div>
    <!-- 面包屑,导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告消息框 -->
      <el-alert title="注意：只允许为第三季分类设置" type="warning" :closable="false" show-icon></el-alert>
      <el-row>
        <el-col>
          选中商品分类
          <el-cascader
            v-model="selectcatekeys"
            :options="catelist"
            :props="cateprops"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isbtndisabled"
            @click="diaisshow=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manytabledata">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  type="primary"
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="closetag(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model.trim="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>

            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="parimary" icon="el-icon-edit" size="mini">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="onley">
          <el-button
            type="primary"
            size="mini"
            :disabled="isbtndisabled"
            @click="diaisshow=true"
          >添加属性</el-button>
          <!-- 静态属性数表格 -->
          <el-table :data="onlytabledata">
            <el-table-column type="expand"></el-table-column>

            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="parimary" icon="el-icon-edit" size="mini">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加分类 -->
    <el-dialog :title="titletext" :visible.sync="diaisshow" width="50%" @close="adddiaclose">
      <el-form :model="addfrom" :rules="addfromrules" ref="addfromref" label-width="100px">
        <el-form-item :label="titletext" prop="attr_name">
          <el-input v-model="addfrom.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="diaisshow = false">取 消</el-button>
        <el-button type="primary" @click="addcatefun">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      catelist: [],
      //   级联选择框的配置对象
      cateprops: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover"
      },
      //   级联选择框，双向绑定的数组，用来存数据
      selectcatekeys: [],
      activeName: "many",
      manytabledata: [],
      onlytabledata: [],
      diaisshow: false,
      addfrom: {
        attr_name: ""
      },
      addfromrules: {
        attr_name: [{ required: true, message: "请输入", trigger: "blur" }]
      },
      //   控制按钮与文本框的切换显示
      inputVisible: false,
      inputValue: ""
    };
  },
  methods: {
    //   获取所有商品分类列表
    async getcategorieslist() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$msg.error("获取数据失败");
      }
      this.catelist = res.data;
    },
    // 级联选择框值改变触发的事件
    handleChange() {
      this.getParamsData();
    },
    // tab页签的点击事件
    handleClick() {
      this.getParamsData();
    },
    async getParamsData() {
      // 如果不是三级分类
      if (this.selectcatekeys.length != 3) {
        this.selectcatekeys = [];
        this.manytabledata=[]
        this.onlytabledata=[]
        return;
      }
      //   根据所选的分类的id，和当前所处的面板
      const { data: res } = await this.$http.get(
        `categories/${this.cateid}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      );
      if (res.meta.status !== 200) {
        return this.$msg.error("获取数据失败");
      }
      console.log(res.data);
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];
        //控制文本框显示与隐藏
        (item.inputVisible = false), (item.inputValue = "");
      });
      if (this.activeName == "many") {
        this.manytabledata = res.data;
      } else {
        this.onlytabledata = res.data;
      }
    },
    adddiaclose() {
      this.$refs.addfromref.resetFields();
    },
    addcatefun() {
      this.$refs.addfromref.validate(async val => {
        if (!val) {
          return;
        }
        const { data: res } = await this.$http.post(
          `categories/${this.cateid}/attributes`,
          {
            attr_name: this.addfrom.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) {
          return this.$msg.error("添加失败");
        }
        this.$msg.success("添加成功");
        this.diaisshow = false;
        this.getParamsData();
      });
    },
    // 文本框失去焦点，或按enter触发的事件
    async handleInputConfirm(info) {
      if (info.inputValue) {
        info.attr_vals.push(info.inputValue);
        info.inputValue = "";
      
    const {data:res}=await    this.$http.put(`categories/${this.cateid}/attributes/${info.attr_id}`,{
            attr_name:info.attr_name,
            attr_sel:info.attr_sel,
            attr_vals:info.attr_vals.join(' ')
        })
        if (res.meta.status !== 200) {
        return this.$msg.error("失败");
      }
      this.$msg.success('成功')
      info.inputVisible = false;
      }
    },
    // 点击new tag展示文本输入框
    showInput(info) {
      info.inputVisible = true;
      // 让文本框自动获取焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // tag的删除
    async closetag(i,info){
        info.attr_vals.splice(i,1)
         const {data:res}=await    this.$http.put(`categories/${this.cateid}/attributes/${info.attr_id}`,{
            attr_name:info.attr_name,
            attr_sel:info.attr_sel,
            attr_vals:info.attr_vals.join(' ')
        })
        if (res.meta.status !== 200) {
        return this.$msg.error("失败");
      }
      this.$msg.success('成功')
    }
  },
  created() {
    this.getcategorieslist();
  },
  computed: {
    //   用计算属性来改变按钮的禁用实现
    isbtndisabled() {
      if (this.selectcatekeys.length != 3) {
        return true;
      } else {
        return false;
      }
    },
    //   当前选中的三级分类的id
    cateid() {
      if (this.selectcatekeys.length == 3) {
        return this.selectcatekeys[2];
      }
      return null;
    },
    titletext() {
      if (this.activeName == "many") {
        return "添加动态参数";
      } else return "添加静态属性";
    }
  }
};
</script>
<style lang="less" scoped>
.el-row {
  margin: 15px 0px;
}
.el-tag {
  margin-left: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>