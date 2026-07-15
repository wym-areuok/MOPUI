<template>
    <el-form>
        <el-form-item>
            <el-radio :value="1" v-model='radioValue'>
                {{ $t('page.cron年通配符说明') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio :value="2" v-model='radioValue'>
                {{ $t('page.cron每年') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio :value="3" v-model='radioValue'>
                {{ $t('page.cron周期从') }}
                <el-input-number v-model='cycle01' :min='fullYear' :max="2098"/> -
                <el-input-number v-model='cycle02' :min="cycle01 ? cycle01 + 1 : fullYear + 1" :max="2099"/>
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio :value="4" v-model='radioValue'>
                {{ $t('page.cron从') }}
                <el-input-number v-model='average01' :min='fullYear' :max="2098"/> {{ $t('page.cron年开始每') }}
                <el-input-number v-model='average02' :min="1" :max="2099 - average01 || fullYear"/> {{ $t('page.cron年执行一次') }}
            </el-radio>

        </el-form-item>

        <el-form-item>
            <el-radio :value="5" v-model='radioValue'>
                {{ $t('page.cron指定') }}
                <el-select clearable v-model="checkboxList" :placeholder="$t('page.cron可多选')" multiple :multiple-limit="8">
                    <el-option v-for="item in 9" :key="item" :value="item - 1 + fullYear" :label="item -1 + fullYear" />
                </el-select>
            </el-radio>
        </el-form-item>
    </el-form>
</template>

<script setup>
const emit = defineEmits(['update'])
const props = defineProps({
    cron: {
        type: Object,
        default: {
            second: "*",
            min: "*",
            hour: "*",
            day: "*",
            month: "*",
            week: "?",
            year: ""
        }
    },
    check: {
        type: Function,
        default: () => {
        }
    }
})

const fullYear = Number(new Date().getFullYear())
const maxFullYear = fullYear + 10
const radioValue = ref(1)
const cycle01 = ref(fullYear)
const cycle02 = ref(fullYear + 1)
const average01 = ref(fullYear)
const average02 = ref(1)
const checkboxList = ref([])
const checkCopy = ref([fullYear])

const cycleTotal = computed(() => {
    const c1 = props.check(cycle01.value, fullYear, maxFullYear - 1)
    const c2 = props.check(cycle02.value, c1 + 1, maxFullYear)
    return c1 + '-' + c2
})
const averageTotal = computed(() => {
    const a1 = props.check(average01.value, fullYear, maxFullYear - 1)
    const a2 = props.check(average02.value, 1, 10)
    return a1 + '/' + a2
})
const checkboxString = computed(() => {
    return checkboxList.value.join(',')
})
watch(() => props.cron.year, value => changeRadioValue(value))
watch([radioValue, cycleTotal, averageTotal, checkboxString], () => onRadioChange())
function changeRadioValue(value) {
    if (value === '') {
        radioValue.value = 1
    } else if (value === "*") {
        radioValue.value = 2
    } else if (value.indexOf("-") > -1) {
        const indexArr = value.split('-')
        cycle01.value = Number(indexArr[0])
        cycle02.value = Number(indexArr[1])
        radioValue.value = 3
    } else if (value.indexOf("/") > -1) {
        const indexArr = value.split('/')
        average01.value = Number(indexArr[0])
        average02.value = Number(indexArr[1])
        radioValue.value = 4
    } else {
        checkboxList.value = [...new Set(value.split(',').map(item => Number(item)))]
        radioValue.value = 5
    }
}
function onRadioChange() {
    switch (radioValue.value) {
        case 1:
            emit('update', 'year', '', 'year')
            break
        case 2:
            emit('update', 'year', '*', 'year')
            break
        case 3:
            emit('update', 'year', cycleTotal.value, 'year')
            break
        case 4:
            emit('update', 'year', averageTotal.value, 'year')
            break
        case 5:
            if (checkboxList.value.length === 0) {
                checkboxList.value.push(checkCopy.value[0])
            } else {
                checkCopy.value = checkboxList.value
            }
            emit('update', 'year', checkboxString.value, 'year')
            break
    }
}
</script>

<style lang="scss" scoped>
.el-input-number--small, .el-select, .el-select--small {
    margin: 0 0.2rem;
}
.el-select, .el-select--small {
    width: 18.8rem;
}
</style>