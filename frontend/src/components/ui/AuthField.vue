<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    label: string
    name: string
    type?: 'text' | 'email' | 'password' | 'url'
    autocomplete?: string
    error?: string
  }>(),
  { type: 'text', autocomplete: 'off' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="block space-y-1.5 text-sm font-medium text-slate-700" :for="name">
    <span>{{ label }}</span>
    <input
      :id="name"
      :name="name"
      :type="type"
      :autocomplete="autocomplete"
      :value="modelValue"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${name}-error` : undefined"
      class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" :id="`${name}-error`" class="block text-xs font-normal text-red-700">{{ error }}</span>
  </label>
</template>
