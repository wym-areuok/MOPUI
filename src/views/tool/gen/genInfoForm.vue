<template>
  <el-form ref="genInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item prop="tplCategory">
          <template #label>{{ $t('page.生成模板') }}</template>
          <el-select v-model="info.tplCategory" @change="tplSelectChange">
            <el-option :label="$t('page.单表（增删改查）')" value="crud" />
            <el-option :label="$t('page.树表（增删改查）')" value="tree" />
            <el-option :label="$t('page.主子表（增删改查）')" value="sub" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="tplWebType">
          <template #label>{{ $t('page.前端类型') }}</template>
          <el-select v-model="info.tplWebType">
            <el-option :label="$t('page.Vue2 Element UI 模版')" value="element-ui" />
            <el-option :label="$t('page.Vue3 Element Plus 模版')" value="element-plus" />
            <el-option :label="$t('page.Vue3 Element Plus TypeScript 模版')" value="element-plus-typescript" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="packageName">
          <template #label>
            {{ $t('page.生成包路径') }}
            <el-tooltip :content="$t('page.生成在哪个java包下，例如 com.mop.system')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.packageName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="moduleName">
          <template #label>
            {{ $t('page.生成模块名') }}
            <el-tooltip :content="$t('page.可理解为子系统名，例如 system')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.moduleName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="businessName">
          <template #label>
            {{ $t('page.生成业务名') }}
            <el-tooltip :content="$t('page.可理解为功能英文名，例如 user')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.businessName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="functionName">
          <template #label>
            {{ $t('page.生成功能名') }}
            <el-tooltip :content="$t('page.用作类描述，例如 用户')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.functionName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="formColNum">
          <template #label>
            {{ $t('page.表单布局') }}
            <el-tooltip :content="$t('page.选择表单的栅格布局方式')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-select v-model="info.formColNum">
            <el-option :label="$t('page.单列')" :value="1" />
            <el-option :label="$t('page.双列')" :value="2" />
            <el-option :label="$t('page.三列')" :value="3" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="genView">
          <template #label>{{ $t('page.扩展功能') }}</template>
          <el-checkbox v-model="info.view">{{ $t('page.生成详情页') }}</el-checkbox>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="genType">
          <template #label>
            {{ $t('page.生成代码方式') }}
            <el-tooltip :content="$t('page.默认为zip压缩包下载，也可以自定义生成路径')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-radio v-model="info.genType" value="0">{{ $t('page.zip压缩包') }}</el-radio>
          <el-radio v-model="info.genType" value="1">{{ $t('page.自定义路径') }}</el-radio>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item>
          <template #label>
            {{ $t('page.上级菜单') }}
            <el-tooltip :content="$t('page.分配到指定菜单下，例如 系统管理')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-tree-select
            v-model="info.parentMenuId"
            :data="menuOptions"
            :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
            :placeholder="$t('page.请选择系统菜单')"
            check-strictly
          />
        </el-form-item>
      </el-col>

      <el-col :span="24" v-if="info.genType == '1'">
        <el-form-item prop="genPath">
          <template #label>
            {{ $t('page.自定义路径') }}
            <el-tooltip :content="$t('page.填写磁盘绝对路径，若不填写，则生成到当前Web项目下')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.genPath">
            <template #append>
              <el-dropdown>
                <el-button type="primary">
                  {{ $t('page.最近路径快速选择') }}
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="info.genPath = '/'">{{ $t('page.恢复默认的生成基础路径') }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>
    
    <template v-if="info.tplCategory == 'tree'">
      <h4 class="form-header">{{ $t('page.其他信息') }}</h4>
      <el-row v-show="info.tplCategory == 'tree'">
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('page.树编码字段') }}
              <el-tooltip :content="$t('page.树显示的编码字段名， 如：dept_id')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeCode" :placeholder="$t('page.请选择')">
              <el-option
                v-for="(column, index) in info.columns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('page.树父编码字段') }}
              <el-tooltip :content="$t('page.树显示的父编码字段名， 如：parent_Id')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeParentCode" :placeholder="$t('page.请选择')">
              <el-option
                v-for="(column, index) in info.columns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('page.树名称字段') }}
              <el-tooltip :content="$t('page.树节点的显示名称字段名， 如：dept_name')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeName" :placeholder="$t('page.请选择')">
              <el-option
                v-for="(column, index) in info.columns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <template v-if="info.tplCategory == 'sub'">
      <h4 class="form-header">{{ $t('page.关联信息') }}</h4>
      <el-row>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('page.关联子表的表名') }}
              <el-tooltip :content="$t('page.关联子表的表名， 如：sys_user')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.subTableName" :placeholder="$t('page.请选择')" @change="subSelectChange">
              <el-option
                v-for="(table, index) in tables"
                :key="index"
                :label="table.tableName + '：' + table.tableComment"
                :value="table.tableName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ $t('page.子表关联的外键名') }}
              <el-tooltip :content="$t('page.子表关联的外键名， 如：user_id')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.subTableFkName" :placeholder="$t('page.请选择')">
              <el-option
                v-for="(column, index) in subColumns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

  </el-form>
</template>

<script setup>
import { listMenu } from "@/api/system/menu"

const subColumns = ref([])
const menuOptions = ref([])
const { proxy } = getCurrentInstance()

const props = defineProps({
  info: {
    type: Object,
    default: null
  },
  tables: {
    type: Array,
    default: null
  }
})

// 表单校验
const rules = ref({
  tplCategory: [{ required: true, message: proxy.$t("page.请选择生成模板"), trigger: "blur" }],
  packageName: [{ required: true, message: proxy.$t("page.请输入生成包路径"), trigger: "blur" }],
  moduleName: [{ required: true, message: proxy.$t("page.请输入生成模块名"), trigger: "blur" }],
  businessName: [{ required: true, message: proxy.$t("page.请输入生成业务名"), trigger: "blur" }],
  functionName: [{ required: true, message: proxy.$t("page.请输入生成功能名"), trigger: "blur" }]
})

function subSelectChange(value) {
  props.info.subTableFkName = ""
}

function tplSelectChange(value) {
  if (value !== "sub") {
    props.info.subTableName = ""
    props.info.subTableFkName = ""
  }
}

function setSubTableColumns(value) {
  for (var item in props.tables) {
    const name = props.tables[item].tableName
    if (value === name) {
      subColumns.value = props.tables[item].columns
      break
    }
  }
}

/** 查询菜单下拉树结构 */
function getMenuTreeselect() {
  listMenu().then(response => {
    menuOptions.value = proxy.handleTree(response.data, "menuId")
  })
}

onMounted(() => {
  getMenuTreeselect()
})

watch(() => props.info.subTableName, val => {
  setSubTableColumns(val)
})

watch(() => props.info.tplWebType, val => {
  if (val === '') {
    props.info.tplWebType = "element-plus"
  }
})
</script>
