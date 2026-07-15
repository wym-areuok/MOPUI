<template>
    <el-form>
        <el-form-item>
            <el-radio v-model='radioValue' :value="1">
                {{ $t('page.cron月通配符说明') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="2">
                {{ $t('page.cron周期从') }}
                <el-input-number v-model='cycle01' :min="1" :max="11" /> -
                <el-input-number v-model='cycle02' :min="cycle01 + 1" :max="12" /> {{ $t('page.cron月') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="3">
                {{ $t('page.cron从') }}
                <el-input-number v-model='average01' :min="1" :max="11" /> {{ $t('page.cron月开始每') }}
                <el-input-number v-model='average02' :min="1" :max="12 - average01" /> {{ $t('page.cron月月执行一次') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="4">
                {{ $t('page.cron指定') }}
                <el-select clearable v-model="checkboxList" :placeholder="$t('page.cron可多选')" multiple :multiple-limit="8">
                    <el-option v-for="item in monthList" :key="item.key" :label="item.value" :value="item.key" />
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
const checkboxList = ref([])
const checkCopy = ref([1])
const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const monthList = computed(() => monthNames.map((name, i) => ({ key: i + 1, value: i18n.global.t('page.' + name) })))
const cycleTotal = computed(() => {
    const c1 = props.check(cycle01.value, 1, 11)
    const c2 = props.check(cycle02.value, c1 + 1, 12)
    return c1 + '-' + c2
})
const averageTotal = computed(() => {
    const a1 = props.check(average01.value, 1, 11)
    const a2 = props.check(average02.value, 1, 12 - a1)
    return a1 + '/' + a2
})
const checkboxString = computed(() => {
    return checkboxList.value.join(',')
})
watch(() => props.cron.month, value => changeRadioValue(value))
watch([radioValue, cycleTotal, averageTotal, checkboxString], () => onRadioChange())
function changeRadioValue(value) {
    if (value === '*') {
        radioValue.value = 1
    } else if (value.indexOf('-') > -1) {
        const indexArr = value.split('-')
        cycle01.value = Number(indexArr[0])
        cycle02.value = Number(indexArr[1])
        radioValue.value = 2
    } else if (value.indexOf('/') > -1) {
        const indexArr = value.split('/')
        average01.value = Number(indexArr[0])
        average02.value = Number(indexArr[1])
        radioValue.value = 3
    } else {
        checkboxList.value = [...new Set(value.split(',').map(item => Number(item)))]
        radioValue.value = 4
    }
}
function onRadioChange() {
    switch (radioValue.value) {
        case 1:
            emit('update', 'month', '*', 'month')
            break
        case 2:
            emit('update', 'month', cycleTotal.value, 'month')
            break
        case 3:
            emit('update', 'month', averageTotal.value, 'month')
            break
        case 4:
            if (checkboxList.value.length === 0) {
                checkboxList.value.push(checkCopy.value[0])
            } else {
                checkCopy.value = checkboxList.value
            }
            emit('update', 'month', checkboxString.value, 'month')
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