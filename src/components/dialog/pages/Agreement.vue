<template>
  <dialog-content>
    <template v-slot:header
      >Terms of Service</template
    >
    <section class="tos-wrapper">
      <p class="p p--large">Welcome to Switch!</p>
      <p class="p">
        Kava Labs, Inc (collectively "Kava Labs", "Kava", "we", "us", "our")
        provides services to you through its website located at https://kava.io
        and through its applications and related services (collectively, such
        services, including any new features and applications, and the Site, the
        “Service(s)”) subject to the following terms of service, together with
        any documents and additional terms they expressly incorporate by
        reference (collectively, these “Terms”). We reserve the right, at our
        sole discretion, to make changes to the Terms or the Services, at any
        time. Any such changes will become effective no sooner than fourteen
        (14) days after they are posted, except for changes addressing new
        functions of the Services or changes made for legal reasons, which are
        effective immediately. The Terms are entered into between Kava and you
        or the company or other legal entity you represent (“you” or “your”),
        and constitute a binding legal agreement.
        <span class="--emphasis">
          Accordingly, you represent that: (a) if you are agreeing to these
          Terms on behalf of a company or other legal entity, you have the legal
          authority to bind the company or other legal entity to these Terms;
          and (b) you are at least 18 years old (or the age of majority where
          you reside, whichever is older), can form a legally binding contract
          online, and have the full, right, power and authority to enter into
          and to comply with the obligations under these Terms. In addition to
          the foregoing, you also represent and warrant that you are not a
          citizen or resident of a state, country, territory or other
          jurisdiction that is embargoed by the United States or where your use
          of the Portal or the Services would be illegal or otherwise violate
          any applicable law.
        </span>
      </p>
      <p class="p p--emphasis">KEY DEFINITIONS</p>
      <ol class="p">
        <li>
          "Digital Assets" means virtual tokens, currencies, and
          cryptocurrencies that are distributed and secured via a decentralized
          blockchain protocol.
        </li>
        <li>
          "Layer 2" means a suite of related technologies that allows digital
          assets to be exchanged off-ledger, without the use of the blockchain,
          while the integrity of these off-chain transactions can be enforced by
          the blockchain.
        </li>
      </ol>
      <p class="p p--emphasis">SERVICES</p>
      <ol class="p">
        <li>
          The primary purpose of Switch is to enable users to store certain
          digital assets using Layer 2 technologies.
        </li>
        <li>
          Some services involve the use of the blockchains that control the
          digital assets in Switch. The use of these blockchains may require
          that you pay a fee for the computation resources required to perform a
          transaction.
        </li>
      </ol>
      <p class="p p--emphasis">Account Security</p>
      <p class="p">
        You are responsible for maintaining the privacy and security of your
        account and private keys, and for any and all activities that occur
        under your private keys or account. Kava will not be liable for any loss
        or damage arising from failure to comply with this section.
      </p>
      <p class="p">
        Kava does not endorse or recommend any particular digital asset,
        transaction, or purchasing strategy. No content on the Kava website nor
        communications with company personnel constitutes purchase or investment
        advice. Independent advice should be sought where appropriate. You
        acknowledge and agree that all transaction decisions are made solely by
        you and Kava bears no responsibility or liability for the outcome of
        your decisions.
      </p>
      <p class="p p--emphasis">DISCLOSURES; DISCLAIMERS</p>
      <p class="p">
        <span class="--emphasis">
          To the maximum extent permitted under Applicable Law, the Services
          (and any of their content or functionality) provided by or on behalf
          of us are provided on an “AS IS” and “AS AVAILABLE” basis, and we
          expressly disclaim, and you hereby waive, any representations,
          conditions or warranties of any kind, whether express or implied,
          legal, statutory or otherwise, or arising from statute, otherwise in
          law, course of dealing, or usage of trade, including, without
          limitation, the implied or legal warranties and conditions of
          merchantability, merchantable quality, quality or fitness for a
          particular purpose, title, security, availability, reliability,
          accuracy, quiet enjoyment and non-infringement of third party rights.
          Without limiting the foregoing, we do not represent or warrant that
          the Services (including any data relating thereto) will be
          uninterrupted, available at any particular time or error-free.
          Further, we do not warrant that errors in the Service are correctable
          or will be correctable. You acknowledge that your data may become
          irretrievably lost or corrupted or temporarily unavailable due to a
          variety of causes, and agree that, to the maximum extent permitted
          under Applicable Law, we will not be liable for any loss or damage
          caused by denial- of-service attacks, software failures, viruses or
          other technologically harmful materials (including those which may
          infect your computer equipment), protocol changes by third party
          providers, Internet outages, force majeure events or other disasters,
          scheduled or unscheduled maintenance, or other causes either within or
          outside our control. The disclaimer of implied warranties contained
          herein may not apply if and to the extent such warranties cannot be
          excluded or limited under the Applicable Law of the jurisdiction in
          which you reside. You are responsible for complying with all laws and
          regulations applicable to your transactions, including, but not
          limited to, the Commodity Exchange Act and the regulations promulgated
          thereunder by the U.S. Commodity Futures Trading Commission (“CFTC”),
          and the federal securities laws and the regulations promulgated
          thereunder by the U.S. Securities and Exchange Commission (“SEC”).
        </span>
        You understand that Kava is not registered or licensed by the CFTC, the
        SEC, or any financial regulatory authority. No financial regulatory
        authority has reviewed or approved the use of Switch. This website does
        not constitute advice or a recommendation concerning any commodity,
        security or other asset. Kava Labs is not acting as an investment
        adviser or commodity trading adviser to any person.
      </p>
      <p class="p p--emphasis">Third Party Protocols and Services</p>
      <p class="p">
        Switch exposes the functionality of third party protocols that use
        blockchain technology to allow users to exchange Digital Assets in a
        peer-to-peer manner. These third party protocols and services are not
        controlled by Kava and we cannot guarantee these protocols do not
        contain bugs or work as advertised. Accordingly, Kava will not be liable
        for any loss or damage arising from the use of third party services. Any
        loss or damage arising from these services must be handled between you
        and the third party service provider.
      </p>
    </section>
    <p class="p">
      By clicking "Agree," you agree to the Terms of Service outlined above.
    </p>
    <template v-slot:footer>
      <m-button raised @click="$store.dispatch('agreeToTerms')">Agree</m-button>
    </template>
  </dialog-content>
</template>

<script>
import DialogContent from '@/components/dialog/DialogContent.vue'

export default {
  components: {
    DialogContent
  }
}
</script>

<style lang="scss" scoped>
.tos-wrapper {
  width: 100%;
  height: 250px;
  margin: 10px 0 20px 0;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  box-shadow: inset 0 0 8px gray;

  .p {
    color: rgb(140, 140, 140);
    font-size: 11pt;

    &--large {
      font-size: 18px;
      letter-spacing: 0.25px;
      line-height: 24px;
    }
  }

  .--emphasis {
    font-weight: 500;
  }
}
</style>
