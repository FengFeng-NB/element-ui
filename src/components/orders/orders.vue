<template>
  <div>
    <!-- 面包屑,导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryinfo.query">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary">查询</el-button>
        </el-col>
      </el-row>
      <!-- 表格数据 -->
      <el-table :data="orderlist" stripe border>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay"></el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time"></el-table-column>
        <el-table-column label="操作">
          <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
          <el-button type="success" size="mini" icon="el-icon-location" @click="showparogress"></el-button>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[4, 6, 10]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <el-dialog title="物流进度" :visible.sync="dialogVisible2" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in wuliulist"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      queryinfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      orderlist: [],
      total: 0,
      dialogVisible2: false,
      wuliulist: []
    };
  },
  created() {
    this.getorderlist();
  },
  methods: {
    async getorderlist() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryinfo
      });
      if (res.meta.status !== 200) {
        return this.$msg.error("获取数据失败");
      }
      //   console.log(res.data);

      this.orderlist = res.data.goods;
      this.total = res.data.total;
    },
    handleSizeChange(newsize) {
      this.queryinfo.pagesize = newsize;
      this.getorderlist();
    },
    handleCurrentChange(newpage) {
      this.queryinfo.pagenum = newpage;
      this.getorderlist();
    },

    async showparogress() {
      const { data: res } = await this.$http.get("/kuaidi/1106975712662");
      if (res.meta.status !== 200) {
        return this.$msg.error("获取物流数据失败");
      }
      this.wuliulist = res.data;

      this.dialogVisible2 = true;
    }
  }
};
</script>
<style lang="less" scoped>
</style>