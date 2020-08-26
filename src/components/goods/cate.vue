<template>
  <div>
    <!-- 面包屑,导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addfun()">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-circle-check" v-if="scope.row.cat_deleted"></i>
          <i class="el-icon-circle-close" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opp">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-sizes="[5, 10, 15]"
        :page-size="2"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog title="提示" :visible.sync="adddiashow" width="50%" @close="adddiaclose">
      <!-- 添加分类主体 -->
      <el-form
        :model="addcateform"
        :rules="addcateformrules"
        ref="addcateformref"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addcateform.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- 指定数据源 -->
          <el-cascader
            v-model="selectedkeys"
            :options="partentcatelist"
            :props="cascaderprops"
            @change="handleChange"
            :clearable="true"
            :change-on-select="true"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddiashow = false">取 消</el-button>
        <el-button type="primary" @click="addcatefun">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品列表
      catelist: [],
      // 查询对象
      queryinfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      //   为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          //   prop: "cat_deleted",
          //   将当前列定义为模板
          type: "template",
          //   模板名称
          template: "isok"
        },

        {
          label: "排序",
          //   prop: "cat_deleted",
          //   将当前列定义为模板
          type: "template",
          //   模板名称
          template: "order"
        },
        {
          label: "操作",
          //   prop: "cat_deleted",
          //   将当前列定义为模板
          type: "template",
          //   模板名称
          template: "opp"
        }
      ],
      //   添加分类的对话框显示与隐藏
      adddiashow: false,
      //   添加分类的表单数据对象
      addcateform: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0
      },
      //   验证规则对象
      addcateformrules: {
        cat_name: [{ required: true, message: "请输入", trigger: "blur" }],
        cat_level: [{ required: true, message: "请输入", trigger: "blur" }]
      },
      //   父级分类数据的类别
      partentcatelist: [],
      //   指定级联选择器的配置选项
      cascaderprops: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover"
      },
      // 存放选中的分类id
      selectedkeys: []
    };
  },
  methods: {
    //   获取商品数据
    async getcatelist() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryinfo
      });
      if (res.meta.status !== 200) {
        return this.$msg.error("获取分类数据失败");
      }
      this.catelist = res.data.result;
      this.total = res.data.total;
      console.log(res.data.result);
    },
    // 监听pagesize
    handleSizeChange(size) {
      this.queryinfo.pagesize = size;
      this.getcatelist();
    },
    // 监听
    handleCurrentChange(page) {
      this.queryinfo.pagenum = page;
      this.getcatelist();
    },
    // 点击按钮添加到分类显示
    addfun() {
      // 获取父级分类的数据列表
      this.getparentcatelist();
      this.adddiashow = true;
    },
    // 获取父级分类1的数据列表
    async getparentcatelist() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$msg.error("获取数据失败");
      }
      this.partentcatelist = res.data;
    },
    // 选择改变事件
    handleChange() {
      // 如果selectkey数组中的length》0证明选择了分类，
      // 否则就是没有选中
      if (this.selectedkeys.length > 0) {
        // 父级分类的id
        this.addcateform.cat_pid = this.selectedkeys[
          this.selectedkeys.length - 1
        ];
        // 等级
        this.addcateform.cat_level = this.selectedkeys.length;
        return;
      } else {
        this.addcateform.cat_pid = 0;
        this.addcateform.cat_level = 0;
      }
    },
    // 点击按钮确认添加新的分类
    addcatefun() {
      // console.log(this.selectedkeys)
      this.$refs.addcateformref.validate(async val => {
        if (!val) {
          return;
        }
        const { data: res } = await this.$http.post(
          "categories",
          this.addcateform
        );
        if (res.meta.status !== 201) {
          return this.$msg.error("添加分类失败");
        }
        this.$msg.success("添加分类成功");
        this.getcatelist();
        this.adddiashow = false;
      });
    },
    // 关闭点击分类的弹框
    adddiaclose() {
      this.$refs.addcateformref.resetFields();
      this.selectedkeys = [];
      this.addcateform.cat_level = 0;
      this.addcateform.cat_pid = 0;
    }
    // 分类功能
    //
  },
  created() {
    this.getcatelist();
  }
};
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>