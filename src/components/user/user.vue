<template>
  <div>
    <!-- 面包屑,导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="querinfo.query" clearable @clear="clear">
            <el-button slot="append" icon="el-icon-search" @click="serach"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addshow=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" label="#" width="180"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- scope就是你这一行的数据 -->
            <!-- {{scope.row}} -->
            <el-switch
              @change="userstatechange(scope.row)"
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editshow(scope.row)"></el-button>
            <!-- 删除 -->
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="del(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-setting"
                @click="fenpeifun(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querinfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="querinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addshow" width="50%" @close="addclose">
      <!-- 内容主体 -->
      <el-form ref="addformref" :model="addform" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addform.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addform.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addform.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addform.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addshow = false">取 消</el-button>
        <el-button type="primary" @click="addsumbit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editisshow" width="30%" @close="editclose">
      <!-- 表单 -->
      <el-form ref="editref" :model="editfrom" label-width="80px" :rules="editrules">
        <el-form-item label="用户名">
          <el-input v-model="editfrom.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editfrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editfrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editisshow = false">取 消</el-button>
        <el-button type="primary" @click="editsumbit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->

    <el-dialog title="分配角色" :visible.sync="fenpeishow" width="50%" @close="closerole">
      <!-- 主体 -->
      <div>
        <p>当前用户：{{userinfo.username}}</p>
        <p>当前角色：{{userinfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selected" placeholder="请选择">
            <el-option
              v-for="item in rolelist"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="fenpeishow = false">取 消</el-button>
        <el-button type="primary" @click="fenpeirole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    //   自定义邮箱校验规则
    var checkemail = (rule, value, cb) => {
      const regemail = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
      if (regemail.test(value)) {
        //合法
        return cb();
      }
      cb(new Error("请输入合法邮箱"));
    };
    //   自定义手机号校验规则
    var checkmobile = (rule, value, cb) => {
      const regmobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regmobile.test(value)) {
        //合法
        return cb();
      }
      cb(new Error("请输入合法手机号"));
    };

    return {
      // 获取用户列表参数的对象
      querinfo: {
        query: "",
        pagenum: 1,
        pagesize: 2
      },
      userlist: "",
      total: 0,
      //   控制添加用户对话框二点显示与隐藏
      addshow: false,
      //   添加用户的表单数据
      addform: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      //   添加用户的表单验证对象
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            require: true,
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            require: true,
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur"
          }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkemail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkmobile, trigger: "blur" }
        ]
      },
      //   控制修改框的显示与隐藏
      editisshow: false,
      //   查询到的用户信息对象
      editfrom: {},
      // 修改用户表单的验证对象
      editrules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkemail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkmobile, trigger: "blur" }
        ]
      },
      // 分配角色的对话框
      fenpeishow: false,
      // 需要分配权限的用户信息
      userinfo: {},
      // 所有角色列表数据
      rolelist: [],
      // 下拉框选中后的值
      selected: ""
    };
  },
  methods: {
    // 获取用户数据
    async getuserlist() {
      const { data: res } = await this.$http.get("users", {
        params: this.querinfo
      });
      console.log(res);
      if (res.meta.status != 200) return this.$msg.error("获取用户列表失败");
      this.userlist = res.data.users;
      this.total = res.data.total;
    },
    // 监听pagesize的改变事件
    handleSizeChange(newsize) {
      this.querinfo.pagesize = newsize;
      this.getuserlist();
    },
    // 监听,页码值改变事件
    handleCurrentChange(newpage) {
      this.querinfo.pagenum = newpage;
      this.getuserlist();
    },
    // 开关改变状态
    async userstatechange(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      // console.log(res)
      if (res.meta.status !== 200) {
        userinfo.mg_status = !userinfo.mg_status;
        return this.$msg.error("用户修改失败");
      }
      this.$msg.success("更新状态成功");
    },
    //搜索
    serach() {
      this.getuserlist();
    },
    // 清空输入框
    clear() {
      this.getuserlist();
    },
    // 关闭对话框时的事件
    addclose() {
      this.$refs.addformref.resetFields();
    },
    // 添加用户功能按钮
    addsumbit() {
      this.$refs.addformref.validate(async val => {
        if (!val) return;
        // 可以发起用户请求
        const { data: res } = await this.$http.post("users", this.addform);
        if (res.meta.status !== 201) {
          return this.$msg.error("用户添加失败");
        }
        this.$msg.success("用户添加成功");
        //隐藏对话框
        (this.addshow = false), this.getuserlist();
      });
    },
    // 展示编辑用户的对话框
    async editshow(userinfo) {
      const { data: res } = await this.$http.get(`users/${userinfo.id}`);
      if (res.meta.status != 200) return this.$msg.error("查询用户信息失败");
      this.editfrom = res.data;
      this.editisshow = true;
    },
    //    关闭修改对话框,并清空
    editclose() {
      this.$refs.editref.resetFields();
    },
    // 修改用户信息并提交
    editsumbit() {
      this.$refs.editref.validate(async val => {
        if (!val) return;
        const { data: res } = await this.$http.put(
          "users/" + this.editfrom.id,
          {
            email: this.editfrom.email,
            mobile: this.editfrom.mobile
          }
        );
        if (res.meta.status != 200) {
          return this.$msg.error("修改失败");
        }
        this.$msg.success("修改成功");
        this.editisshow = false;
        this.getuserlist();
      });
    },
    // 删除用户
    async del(id) {
      // 这是一个promise
      const b = await this.$confirm("是否删除用户, 是否继续?", "提示", {
        condfirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err);
      if (b != "confirm") {
        return this.$msg.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status != 200) {
        return this.$msg.error("删除失败");
      }
      this.$msg.success("修删除成功");
      this.getuserlist();
    },
    // 分配角色的对话框显示与隐藏
    async fenpeifun(userinfo) {
      this.userinfo = userinfo;

      //获取所有角色列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$msg.error("获取角色列表数据失败");
      }
      this.rolelist = res.data;
      this.fenpeishow = true;
    },
    // 分配角色的确认按钮
    async fenpeirole() {

      if (!this.selected) {
        this.$msg.error("未选择身份");
      }
      const {
        data: res
      } = await this.$http.put(
        `users/${this.userinfo.id}/role`, {
        rid: this.selected
      });
      if (res.meta.status !== 200) {
        return this.$msg.error("更新角色失败");
      }
      this.$msg.success("更新角色成功");
      this.getuserlist();
      this.fenpeishow = false;
    },
    closerole(){
      this.selected=''
      this.userinfo={}
    }
  },
  created() {
    this.getuserlist();
  }
};
</script>
<style lang="less" scoped>
</style>