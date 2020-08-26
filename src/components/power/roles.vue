<template>
  <div>
    <!-- 面包屑,导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdtom','vcenter',i==0? 'bdtop':'' ]"
              v-for="(item,i) in scope.row.children"
              :key="item.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="tagremove(scope.row,item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- er级权限和三级 -->
              <el-col :span="19">
                <!-- for嵌套渲染二级权限 -->
                <el-row
                  :class="['vcenter', i2==0? '':'bdtop']"
                  v-for="(sonitem,i2) in item.children"
                  :key="sonitem.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="tagremove(scope.row,sonitem.id)"
                      type="success"
                    >{{sonitem.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="tagremove(scope.row,item3.id)"
                      type="warning"
                      v-for="item3  in sonitem.children"
                      :key="item3.id"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
                    {{scope.row}}
            </pre>-->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>

        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showsetright(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限 -->
    <el-dialog title="分配权限" :visible.sync="setrightshow" width="50%" @close="setrightshowclose">
      <!-- 树形控件 -->
      <el-tree
        :data="rightlist"
        :props="treeProps"
        ref="treeref"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defkeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setrightshow = false">取 消</el-button>
        <el-button type="primary" @click="fenpeiquanx()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],
      //
      setrightshow: false,
      // 所有权限的数据
      rightlist: [],
      // 树形控件属性绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      // 默认选择的节点id值数组
      defkeys: [],
      // 当前即将分配权限的id
      roleid:'',
    };
  },
  created() {
    this.getroulelist();
  },
  methods: {
    async getroulelist() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status != 200) {
        return this.$msg.error("获取角色列表失败");
      }
      this.rolelist = res.data;
    },
    // 删除tag
    async tagremove(role, id) {
      // 弹框提示
      const b = await this.$confirm("是否删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err);
      if (b != "confirm") {
        return this.$msg.error("已取消");
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${id}`
      );
      if (res.meta.status !== 200) {
        return this.$msg.error("删除权限失败");
      }
      //   this.getroulelist()
      role.children = res.data;
    },
    //    展示分配权限的对话框
    async showsetright(role) {
      this.roleid=role.id
      //    获取所有权限数据
      const { data: res } = await this.$http.get("rights/tree");
      //    获取三级节点的id,用于打开时勾选
      this.getLeafKeys(role, this.defkeys);
      //  显示与隐藏
      this.setrightshow = !this.setrightshow;
      if (res.meta.status !== 200) {
        return this.$msg.error("获取权限数据失败");
      }
      this.rightlist = res.data;
    },
    // 通过第规获取角色下三级权限的id，给到defkeys中
    getLeafKeys(node, arr) {
      // 当前node节点不包含children则不是
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr);
      });
    },
    // 分配选取对话框关闭事件
    setrightshowclose(){
      this.defkeys=[]
    },
    // 分配权限的确定按钮，点击按钮分配权限
  async  fenpeiquanx(){
      const key=[
        ...this.$refs.treeref.getCheckedKeys(),
        ...this.$refs.treeref.getHalfCheckedKeys()
      ]
      const idstr=key.join(',')
      const {data:res}=await this.$http.post(`roles/${this.roleid}/rights`,{rids:idstr})
       if (res.meta.status !== 200) {
        return this.$msg.error("分配权限数据失败");
      }
      this.$msg.success('分配权限数据成功')
      console.log(idstr)
      this.getroulelist();
      this.setrightshow = false
    },
    // 
  }
};
</script>
<style lang="less" scoped>
.el-tag {
  margin-top: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdtom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>