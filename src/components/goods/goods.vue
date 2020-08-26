<template>
  <div>
    <!-- 面包屑,导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input @clear="searchname" clearable v-model="queryinfo.query" placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search" @click="searchname"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="parmary" @click="addrouter">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格数据 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price"></el-table-column>
        <el-table-column label="商品数量" prop="goods_number"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" prop="add_time"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="deletegoods(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      queryinfo: {
        query: "",
        pagenum: 1,
        pagesize: 3
      },
      goodslist: [],
      total: 0
    };
  },
  methods: {
    async getgoodslist() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryinfo
      });
      if (res.meta.status != 200) {
        return this.$msg.error("获取商品数据失败");
      }
      this.goodslist = res.data.goods;
      //   console.log(this.goodslist)
      this.total = res.data.total;
    },
    handleSizeChange(newsize) {
      this.queryinfo.pagesize = newsize;
      this.getgoodslist();
    },
    handleCurrentChange(newpage) {
      this.queryinfo.pagenum = newpage;
      this.getgoodslist();
    },
    searchname() {
      this.getgoodslist();
    },
    deletegoods(id) {
      this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async res => {
          const { data: b } = await this.$http.delete(`goods/${id}`);
          if (b.meta.status != 200) {
            return this.$msg.error("删除商品失败");
          }
          this.$msg.success("删除商品成功");
          this.getgoodslist()
        })
        .catch(err => err);
    },
    addrouter(){
        this.$router.push('/goods/add')
    },
  },
  created() {
    this.getgoodslist();
  }
};
</script>
<style lang="less" scoped>
</style>