<script setup>

</script>
<template>
    <div>
        <h1>{{title}}</h1>
        <p>{{description}}</p>
    </div>
</template>

<style scoped>

</style>

<script>
    export default {
        props: {
            title: {
                type: String,
                default: 'Blorum'
            },
            description: {
                type: String,
                default: 'Blorum'
            }
        }
    }
</script>