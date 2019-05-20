<template>
  <dialog-content>
    <template v-slot:header
      >Add Lightning</template
    >
    <p v-if="$store.getters.isMainnet" class="p">
      Configure a new card with credentials for a Bitcoin LND node.
    </p>
    <p v-else class="p">
      Configure a new card with credentials for a Bitcoin testnet LND node.
    </p>
    <m-text-field
      id="lnd-hostname"
      v-model="$store.state.route.config.hostname"
      class="field"
      outlined
      placeholder="localhost"
    >
      <m-floating-label for="lnd-hostname">Hostname</m-floating-label>
    </m-text-field>
    <m-text-field
      id="lnd-grpc-port"
      v-model="$store.state.route.config.grpcPort"
      class="field"
      outlined
      placeholder="10009"
    >
      <m-floating-label for="lnd-grpc-port">gRPC Port</m-floating-label>
    </m-text-field>
    <m-text-field
      id="lnd-tls-cert"
      v-model="$store.state.route.config.tlsCert"
      class="field field--textarea"
      textarea
      outlined
      placeholder="LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNpRENDQWkrZ0F3SUJBZ0lRZG81djBRQlhIbmppNGhSYWVlTWpOREFLQmdncWhrak9QUVFEQWpCSE1SOHcKSFFZRFZRUUtFeFpzYm1RZ1lYVjBiMmRsYm1WeVlYUmxaQ0JqWlhKME1TUXdJZ1lEVlFRREV4dEtkWE4wZFhOegpMVTFoWTBKdmIyc3RVSEp2TFRNdWJHOWpZV3d3SGhjTk1UZ3dPREl6TURVMU9ERXdXaGNOTVRreE1ERTRNRFUxCk9ERXdXakJITVI4d0hRWURWUVFLRXhac2JtUWdZWFYwYjJkbGJtVnlZWFJsWkNCalpYSjBNU1F3SWdZRFZRUUQKRXh0S2RYTjBkWE56TFUxaFkwSnZiMnN0VUhKdkxUTXViRzlqWVd3d1dUQVRCZ2NxaGtqT1BRSUJCZ2dxaGtpTwpQUU1CQndOQ0FBU0ZoUm0rdy9UMTBQb0t0ZzRsbTloQk5KakpENDczZmt6SHdQVUZ3eTkxdlRyUVNmNzU0M2oyCkpyZ0ZvOG1iVFYwVnRwZ3FrZksxSU1WS01MckYyMXhpbzRIOE1JSDVNQTRHQTFVZER3RUIvd1FFQXdJQ3BEQVAKQmdOVkhSTUJBZjhFQlRBREFRSC9NSUhWQmdOVkhSRUVnYzB3Z2NxQ0cwcDFjM1IxYzNNdFRXRmpRbTl2YXkxUQpjbTh0TXk1c2IyTmhiSUlKYkc5allXeG9iM04wZ2dSMWJtbDRnZ3AxYm1sNGNHRmphMlYwaHdSL0FBQUJoeEFBCkFBQUFBQUFBQUFBQUFBQUFBQUFCaHhEK2dBQUFBQUFBQUFBQUFBQUFBQUFCaHhEK2dBQUFBQUFBQUF3bGM5WmMKazdiRGh3VEFxQUVFaHhEK2dBQUFBQUFBQUJpTnAvLytHeFhHaHhEK2dBQUFBQUFBQUtXSjV0bGlET1JqaHdRSwpEd0FDaHhEK2dBQUFBQUFBQUc2V3ovLyszYXRGaHhEOTJ0RFF5djRUQVFBQUFBQUFBQkFBTUFvR0NDcUdTTTQ5CkJBTUNBMGNBTUVRQ0lBOU85eHRhem1keENLajBNZmJGSFZCcTVJN0pNbk9GUHB3UlBKWFFmcllhQWlCZDVOeUoKUUN3bFN4NUVDblBPSDVzUnB2MjZUOGFVY1hibXlueDlDb0R1ZkE9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg=="
    >
      <m-floating-label for="lnd-tls-cert"
        >TLS Certificate (base64)</m-floating-label
      >
    </m-text-field>
    <m-text-field
      id="lnd-macaroon"
      v-model="$store.state.route.config.macaroon"
      class="field field--textarea"
      textarea
      outlined
      placeholder="AgEDbG5kArsBAwoQ3/I9f6kgSE6aUPd85lWpOBIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV32ml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaFgoHbWVzc2FnZRIEcmVhZBIFd3JpdGUaFwoIb2ZmY2hhaW4SBHJlYWQSBXdyaXRlGhYKB29uY2hhaW4SBHJlYWQSBXdyaXRlGhQKBXBlZXJzEgRyZWFkEgV3cml0ZQAABiAiUTBv3Eh6iDbdjmXCfNxp4HBEcOYNzXhrm+ncLHf5jA=="
    >
      <m-floating-label for="lnd-macaroon"
        >Admin Macaroon (base64)</m-floating-label
      >
    </m-text-field>
    <template v-slot:footer>
      <config-footer />
    </template>
  </dialog-content>
</template>

<script>
import DialogContent from '@/components/dialog/DialogContent.vue'
import ConfigFooter from '@/components/dialog/pages/ConfigFooter.vue'

export default {
  components: { DialogContent, ConfigFooter }
}
</script>

<style lang="scss" scoped>
.field {
  margin: 10px 0 5px 0;

  &--textarea {
    height: 100px;
  }
}
</style>
