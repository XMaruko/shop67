<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addUserDialog" width="50%" @close="resetForm()">
      <el-form :rules="addUserRules" ref="addUserRef" :model="addUser" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUser.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUser.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUser.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="addUser.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="tianjia()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑修改用户 -->
    <el-dialog title="编辑用户" :visible.sync="editUserDialog" width="50%" @close="resetEditForm()">
      <el-form :rules="editUserRules" ref="editUserRef" :model="editUser" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUser.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUser.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="editUser.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click=" UserDialog = false">取 消</el-button>
        <el-button type="primary" @click="bianji()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 卡片区 -->
    <el-card class="box-card">
      <!-- 搜素框和添加按钮 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入搜索内容"
            class="input-with-select"
            v-model="querycdt.query"
            clearable
            @clear="search()"
            @keyup.enter.native="search()"
          >
            <el-button slot="append" icon="el-icon-search" @click="search()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="7">
          <el-button type="primary" @click="addUserDialog=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 数据列表区域 -->
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="username" label="用户名" width="453"></el-table-column>
        <el-table-column prop="mobile" label="手机号码" width="119"></el-table-column>
        <el-table-column prop="role_name" label="角色" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mg_state" label="状态" width="70">
          <el-switch v-model="info.row.mg_state" slot-scope="info"></el-switch>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="info">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(info.row.id)"
            ></el-button>
            <!-- 我们需要获取到被删除用户的id信息需要获取到当前"每条记录"信息，并从中获取id的字段内容 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delUser(info.row.id)"
            ></el-button>

            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querycdt.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="2"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tot"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getUserList()
  },
  methods: {
    // 收集数据存储
    bianji() {
      // 验证表单
      this.$refs.editUserRef.validate(async valid => {
        if (valid === true) {
          // 获取各个表单域的信息
          // async：需要设置到异步调用挨着"最近"的包围函数
          const { data: dt } = await this.$http.put(
            '/users/' + this.editUser.id,
            this.editUser
          )
          // console.log(dt)
          // console.log()
          // 添加失败处理
          if (dt.meta.status !== 200) {
            return this.$message.error(dt.meta.msg)
          }
          // 数据添加成功
          // 关闭dialog，成功提示，刷新数据
          this.editUserDialog = false
          this.$message.success(dt.meta.msg)
          this.getUserList()
        }
      })
    },
    // 关闭Dialog重置form表单
    resetEditForm() {
      this.$refs.editUserRef.resetFields()
    },
    // 修改用户相关属性
    // 显示修改用户的对话框  接收被修改的用户id
    async showEditDialog(id) {
      console.log(id)

      const { data: dt } = await this.$http.get('users/' + id)
      console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      // 把获取到的修改用户信息赋予给editUser表单数据对象
      this.editUser = dt.data
      this.$message.success(dt.meta.msg)
      this.editUserDialog = true
    },
    // 删除用户
    // @param id：被删除用户的id
    delUser(id) {
      this.$confirm('确定要删除该用户吗？', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          // 服务器端实现删除数据逻辑，具体通过axios实现
          const { data: dt } = await this.$http.delete('users/' + id)
          console.log(dt)
          // 删除判断和提示
          if (dt.meta.status !== 200) {
            return this.$message.error(dt.meta.msg)
          }
          // 删除成功
          this.$message.success(dt.meta.msg)
          // 如果当前页面只有一条数据，那么请给页码做减一操作(前提是当前页码大于1页)
          if (this.userList.length === 1 && this.querycdt.pagenum > 1) {
            this.querycdt.pagenum--
          }
          // 刷新数据
          this.getUserList()
        })

        .catch(() => {})
    },
    // 添加用户对话框的数据并渲染到页面
    tianjia() {
      // 验证表单
      this.$refs.addUserRef.validate(async valid => {
        if (valid) {
          // 获取各个表单域的信息
          // async：需要设置到异步调用挨着"最近"的包围函数
          const { data: dt } = await this.$http.post('/users', this.addUser)
          // console.log(dt)
          // console.log()
          // 添加失败处理
          if (dt.meta.status !== 201) {
            return this.$message.error(dt.meta.msg)
          }
          // 数据添加成功
          // 关闭dialog，成功提示，刷新数据
          this.addUserDialog = false
          this.$message.success(dt.meta.msg)
          this.getUserList()
        }
      })
    },
    // 关闭后重置表单
    resetForm() {
      this.$refs.addUserRef.resetFields()
    },
    /** 数据分页相关1 */
    // 每页数据显示条数变化的处理
    handleSizeChange(val) {
      // val：代表当前改变后每页显示的条数
      // console.log(val)
      // 把变化后的显示条数直接赋予给querycdt.pagesize
      this.querycdt.pagesize = val
      // 根据变化后的每页条数重新获取数据
      this.getUserList()
    },
    // 当前页码变化的处理
    handleCurrentChange(val) {
      // val变化后的当前页码
      // 把变化后页码赋予给querycdt.pagenum
      this.querycdt.pagenum = val
      // 根据变化页码重新获取数据
      this.getUserList()
    },
    // 获取用户列表数据
    async getUserList() {
      const { data: dt } = await this.$http.get('/users', {
        params: this.querycdt
      })
      console.log(dt)
      // 获取数据失败处理
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      // 把获取到的数据总条数赋予给tot存储
      this.tot = dt.data.total
      // 把获得到的数据传递给userlist成员
      this.userList = dt.data.users
    }
  },
  data() {
    // 为校验手机号码生成一个函数
    var checkMobile = (rule, value, callback) => {
      // 手机号码规则：1开始,后接3|5|8|9|7,再后边跟9位数字
      // 正则表达式校验
      if (!/^1[35789]\d{9}$/.test(value)) {
        // 校验失败(请给页面提示错误信息)
        return callback(new Error('手机号码格式不正确'))
      }
      // 校验成功，继续执行
      callback()
    }
    return {
      // 添加新用户表单验证规则
      addUserRules: {
        username: [{ required: true, message: '用户名必填', trigger: 'blur' }],
        password: [{ required: true, message: '密码必填', trigger: 'blur' }],
        email: [{ required: true, message: '邮箱必填', trigger: 'blur' }],
        mobile: [
          { required: true, message: '手机号必填', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 编辑用户表单验证规则
      editUserRules: {
        username: [{ required: true, message: '用户名必填', trigger: 'blur' }],
        email: [{ required: true, message: '邮箱必填', trigger: 'blur' }],
        mobile: [
          { required: true, message: '手机号必填', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 编辑表单对象
      editUser: {
        username: '',
        email: '',
        mobile: ''
      },
      // 添加表单数据对象
      addUser: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 对话框是否显示的标志
      addUserDialog: false,
      editUserDialog: false,
      // 数据记录总条数
      tot: 0,
      // 用户列表数据成员
      userList: [],
      // 获取用户列表参数的部分
      // 该参数在做数据 检索 和 分页 的时候都需要使用
      querycdt: {
        query: '', // 被查询的关键字[数据检索]
        pagenum: 1, // 被查询的页面，默认查询第1页数据[分页1]
        pagesize: 3 // 每页显示的记录条数[分页]
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 15px;
  font-size: 12px;
}
</style>
