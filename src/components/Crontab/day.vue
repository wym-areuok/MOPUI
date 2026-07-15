<template>
    <el-form>
        <el-form-item>
            <el-radio v-model='radioValue' :value="1">
                {{ $t('page.cron日通配符说明') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="2">
                {{ $t('page.cron不指定') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="3">
                {{ $t('page.cron周期从') }}
                <el-input-number v-model='cycle01' :min="1" :max="30" /> -
                <el-input-number v-model='cycle02' :min="cycle01 + 1" :max="31" /> {{ $t('page.cron日') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="4">
                {{ $t('page.cron从') }}
                <el-input-number v-model='average01' :min="1" :max="30" /> {{ $t('page.cron号开始每') }}
                <el-input-number v-model='average02' :min="1" :max="31 - average01" /> {{ $t('page.cron日') }}{{ $t('page.cron执行一次') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="5">
                {{ $t('page.cron每月') }}
                <el-input-number v-model='workday' :min="1" :max="31" /> {{ $t('page.cron号最近工作日') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="6">
                {{ $t('page.cron本月最后一天') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="7">
                {{ $t('page.cron指定') }}
                <el-select clearable v-model="checkboxList" :placeholder="$t('page.cron可多选')" multiple :multiple-limit="10">
                    <el-option v-for="item in 31" :key="item" :label="item" :value="item" />
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
            year: "",
        }
    },
    check: {
        type: Function,
        default: () => {
        }
    }
})
const radioValue = ref(1)
const cycle01 = ref(1)
const cycle02 = ref(2)
const average01 = ref(1)
const average02 = ref(1)
const workday = ref(1)
const checkboxList = ref([])
const checkCopy = ref([1])
const cycleTotal = computed(() => {
    const c1 = props.check(cycle01.value, 1, 30)
    const c2 = props.check(cycle02.value, c1 + 1, 31)
    return c1 + '-' + c2
})
const averageTotal = computed(() => {
    const a1 = props.check(average01.value, 1, 30)
    const a2 = props.check(average02.value, 1, 31 - a1)
    return a1 + '/' + a2
})
const workdayTotal = computed(() => {
    return props.check(workday.value, 1, 31) + 'W'
})
const checkboxString = computed(() => {
    return checkboxList.value.join(',')
})
watch(() => props.cron.day, value => changeRadioValue(value))
watch([radioValue, cycleTotal, averageTotal, workdayTotal, checkboxString], () => onRadioChange())
function changeRadioValue(value) {
    if (value === "*") {
        radioValue.value = 1
    } else if (value === "?") {
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
    } else if (value.indexOf("W") > -1) {
        const indexArr = value.split("W")
        workday.value = Number(indexArr[0])
        radioValue.value = 5
    } else if (value === "L") {
        radioValue.value = 6
    } else {
        checkboxList.value = [...new Set(value.split(',').map(item => Number(item)))]
        radioValue.value = 7
    }
}
// 单选按钮值变化时
function onRadioChange() {
    if (radioValue.value === 2 && props.cron.week === '?') {
        emit('update', 'week', '*', 'day')
    }
    if (radioValue.value !== 2 && props.cron.week !== '?') {
        emit('update', 'week', '?', 'day')
    }
    switch (radioValue.value) {
        case 1:
            emit('update', 'day', '*', 'day')
            break
        case 2:
            emit('update', 'day', '?', 'day')
            break
        case 3:
            emit('update', 'day', cycleTotal.value, 'day')
            break
        case 4:
            emit('update', 'day', averageTotal.value, 'day')
            break
        case 5:
            emit('update', 'day', workdayTotal.value, 'day')
            break
        case 6:
            emit('update', 'day', 'L', 'day')
            break
        case 7:
            if (checkboxList.value.length === 0) {
                checkboxList.value.push(checkCopy.value[0])
            } else {
                checkCopy.value = checkboxList.value
            }
            emit('update', 'day', checkboxString.value, 'day')
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