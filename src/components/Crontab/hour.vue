<template>
    <el-form>
        <el-form-item>
            <el-radio v-model='radioValue' :value="1">
                {{ $t('page.cron小时通配符说明') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="2">
                {{ $t('page.cron周期从') }}
                <el-input-number v-model='cycle01' :min="0" :max="22" /> -
                <el-input-number v-model='cycle02' :min="cycle01 + 1" :max="23" /> {{ $t('page.cron时') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="3">
                {{ $t('page.cron从') }}
                <el-input-number v-model='average01' :min="0" :max="22" /> {{ $t('page.cron时开始每') }}
                <el-input-number v-model='average02' :min="1" :max="23 - average01" /> {{ $t('page.cron时') }}{{ $t('page.cron执行一次') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="4">
                {{ $t('page.cron指定') }}
                <el-select clearable v-model="checkboxList" :placeholder="$t('page.cron可多选')" multiple :multiple-limit="10">
                    <el-option v-for="item in 24" :key="item" :label="item - 1" :value="item - 1" />
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
const cycle01 = ref(0)
const cycle02 = ref(1)
const average01 = ref(0)
const average02 = ref(1)
const checkboxList = ref([])
const checkCopy = ref([0])
const cycleTotal = computed(() => {
    const c1 = props.check(cycle01.value, 0, 22)
    const c2 = props.check(cycle02.value, c1 + 1, 23)
    return c1 + '-' + c2
})
const averageTotal = computed(() => {
    const a1 = props.check(average01.value, 0, 22)
    const a2 = props.check(average02.value, 1, 23 - a1)
    return a1 + '/' + a2
})
const checkboxString = computed(() => {
    return checkboxList.value.join(',')
})
watch(() => props.cron.hour, value => changeRadioValue(value))
watch([radioValue, cycleTotal, averageTotal, checkboxString], () => onRadioChange())
function changeRadioValue(value) {
    if (props.cron.min === '*') {
        emit('update', 'min', '0', 'hour')
    }
    if (props.cron.second === '*') {
        emit('update', 'second', '0', 'hour')
    }
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
            emit('update', 'hour', '*', 'hour')
            break
        case 2:
            emit('update', 'hour', cycleTotal.value, 'hour')
            break
        case 3:
            emit('update', 'hour', averageTotal.value, 'hour')
            break
        case 4:
            if (checkboxList.value.length === 0) {
                checkboxList.value.push(checkCopy.value[0])
            } else {
                checkCopy.value = checkboxList.value
            }
            emit('update', 'hour', checkboxString.value, 'hour')
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