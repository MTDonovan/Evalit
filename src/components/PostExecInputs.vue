<template>
  <tr>
    <td>
      <input v-model="titleModel" class="form-control" type="text" value=""/>
    </td>
    <td>
      <input v-model="expressionModel" class="form-control" type="text" value=""/>
    </td>
    <td>
      <input v-model="resultModel" class="form-control" type="text" value=""/>
    </td>
  </tr>
</template>

<script>
export default {
  name: "PostExecInputs",
  // props: {
  // },
  data() {
    return {
      titleModel     : "",
      expressionModel: "",
      resultModel    : ""
    }
  },
  methods: {
    test() {
      alert(this.value);
    }
  }
}
</script>
