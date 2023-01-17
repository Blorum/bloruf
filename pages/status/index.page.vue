<template>
  <h1>Blorum version: {{data.version}}</h1>
</template>

<script lang="js">
const pageProps = ['data']
export default { props: pageProps }
export const documentProps = {
    title: 'Blorum serverside status',
    description: 'Blorum serverside status'
}
</script>