<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
</script>

<template>
  <div style="padding: 2rem">
    <Card style="max-width: 600px; margin: 0 auto">
      <template #title>PrimeVue Test</template>
      <template #content>
        <p>PrimeVue is working! 🎉</p>
        <div style="display: flex; gap: 1rem; margin-top: 1rem">
          <Button label="Primary" icon="pi pi-check" />
          <Button label="Secondary" icon="pi pi-star" severity="secondary" />
          <Button label="Dark Mode" icon="pi pi-thumbs-up" severity="success" />
          <Button label="Success" icon="pi pi-thumbs-up" severity="success" />
         
          <Button label="Link" icon="pi pi-thumbs-up" severity="link" />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped></style>
