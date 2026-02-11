import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <motion.div
        className="max-w-4xl mx-auto py-20 px-4"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-8 text-foreground"
          variants={fadeInUp}
        >
          Terms of Service
        </motion.h1>

        <motion.div className="prose prose-lg prose-invert max-w-none" variants={fadeInUp}>
          <div className="text-muted-foreground space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">TERMS OF SERVICE OF PROFOLIO</h2>
              <p className="mb-2">(Operated by ORSATH Holdings LLC)</p>
              <p className="mb-4"><strong>Effective Date:</strong> 11/10/2025</p>
              <p className="mb-4">
                This Terms of Service ("Agreement") is a binding contract between the user ("User," "you") and ORSATH Holdings LLC,
                doing business as Profolio ("Profolio," "Company," "we," "us," or "our"). By accessing or using the Profolio website,
                mobile applications, or services (collectively, the "Platform"), creating an account, joining or creating a tournament,
                depositing funds, or receiving a payout, you agree to be bound by this Agreement.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">1. ACCEPTANCE; INCORPORATED POLICIES</h2>
              <p className="mb-2"><strong>1.1. Agreement to Terms.</strong> By using the Platform, you accept and agree to this Agreement and the policies incorporated by reference, including the Privacy Policy, Community & Chat Rules, DMCA Policy, and any posted tournament rules (collectively, the "Policies").</p>
              <p className="mb-2"><strong>1.2. Updates.</strong> We may modify this Agreement from time to time. The current version will be posted on the Platform. Your continued use after the effective date constitutes acceptance of the changes.</p>
              <p className="mb-4"><strong>1.3. Educational/Entertainment Purpose.</strong> Profolio provides educational/entertainment, skill-based simulated stock-trading competitions. We are not a broker-dealer, investment adviser, exchange, or ATS, and no real securities transactions occur on the Platform.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">2. DEFINITIONS</h2>
              <p className="mb-2"><strong>2.1.</strong> "Account" means a registered user account on the Platform.</p>
              <p className="mb-2"><strong>2.2.</strong> "Tournament" means a time-bound simulated trading competition with posted parameters (e.g., entry fee, duration, starting virtual balance, maximum participants, public or private).</p>
              <p className="mb-2"><strong>2.3.</strong> "Virtual Portfolio" means simulated holdings used solely for gameplay and ranking.</p>
              <p className="mb-2"><strong>2.4.</strong> "Funds" means fiat or cryptocurrency deposited for permitted Platform uses (e.g., tournament entry fees or sending tips) and eligible for withdrawal subject to requirements.</p>
              <p className="mb-2"><strong>2.5.</strong> "Fraudulent Conduct" means any conduct described in Section 12 (including hacking, collusion, automation, misappropriation, chargeback abuse, or market data manipulation).</p>
              <p className="mb-2"><strong>2.6.</strong> "Sanctioned Person" means any person or entity on OFAC's Specially Designated Nationals and Blocked Persons List or otherwise subject to U.S. economic sanctions or export control restrictions.</p>
              <p className="mb-4"><strong>2.7.</strong> "Services" means access to the Platform, simulated market data, tournaments, leaderboards, chat, and any related features provided by Profolio.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">3. ELIGIBILITY; AGE GATES; GEOGRAPHIC & SANCTIONS RESTRICTIONS</h2>
              <div className="mb-4">
                <p className="mb-2"><strong>3.1. Age.</strong></p>
                <p className="mb-2 ml-4">(a) <strong>18+.</strong> Users must be at least eighteen (18) years old to deposit Funds, pay entry fees, send tips, receive cash/crypto payouts, or request withdrawals.</p>
                <p className="mb-2 ml-4">(b) <strong>Student Accounts (13–17).</strong> Users aged thirteen to seventeen (13–17) may register a Student Account limited to free tournaments only; Student Accounts are prohibited from all monetary features (deposits, paid entries, tips, withdrawals).</p>
                <p className="mb-4 ml-4">(c) <strong>Under 13.</strong> Children under thirteen (13) are not permitted to use the Platform.</p>
              </div>
              <p className="mb-2"><strong>3.2. Legality.</strong> You are responsible for ensuring that your participation is lawful in your jurisdiction. We may geoblock jurisdictions or void participation where prohibited by law.</p>
              <p className="mb-4"><strong>3.3. Sanctions & Export Controls.</strong> The Platform may not be used by (a) any Sanctioned Person, or (b) anyone located in, ordinarily resident in, or accessing from, a comprehensively sanctioned jurisdiction or where use of the Platform would violate U.S. law. By using the Platform, you represent and warrant that you are not a Sanctioned Person and are not located in a prohibited jurisdiction. We may screen and refuse, suspend, or terminate access to comply with sanctions and export laws.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">4. ACCOUNT REGISTRATION & SECURITY</h2>
              <p className="mb-2"><strong>4.1. Registration Data.</strong> To register, you must provide accurate and complete information, which may include legal name, email, phone number, IP/region, and other requested data. You agree to keep your information current.</p>
              <p className="mb-2"><strong>4.2. One-Account Rule.</strong> Each natural person may maintain only one Account. Accounts are personal and non-transferable. Duplicate, shared, or transferred accounts are prohibited and may be suspended or terminated.</p>
              <p className="mb-2"><strong>4.3. Credentials & Security.</strong> You are responsible for maintaining the confidentiality of your credentials and all activity under your Account. Notify us promptly of any suspected unauthorized use or security breach.</p>
              <p className="mb-4"><strong>4.4. ID Verification.</strong> While general use does not require identity verification, we may request KYC or payment verification at any time (including prior to withdrawals) to meet legal, fraud-prevention, or processor requirements. Failure to complete requested verification may result in holds, denial of withdrawals, or account action.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">5. DESCRIPTION OF SERVICES; SKILL-BASED NATURE</h2>
              <p className="mb-2"><strong>5.1. Simulation Only.</strong> All trading activity on the Platform is simulated. No orders are routed to any broker; no real securities transactions occur.</p>
              <p className="mb-2"><strong>5.2. Skill-Based Competitions.</strong> Tournament outcomes are based on skill (e.g., asset selection, timing, risk management) and not chance. Rankings are determined by the highest final Virtual Portfolio value per Platform calculations at the end of the Tournament.</p>
              <p className="mb-2"><strong>5.3. Market Data.</strong> We utilize real-time/near-real-time market data (e.g., from TradingView/Yahoo Finance). Data may be delayed, interrupted, or inaccurate. See Section 10.</p>
              <p className="mb-4"><strong>5.4. No Advice.</strong> Content on the Platform (including user chat, commentary, rankings, statistics, or educational materials) is for informational/educational purposes only and does not constitute investment, legal, accounting, or tax advice.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">6. TOURNAMENTS; PARAMETERS; PRIVATE TOURNAMENTS</h2>
              <p className="mb-2"><strong>6.1. Creation & Parameters.</strong> Eligible users may create Tournaments and set parameters including entry fee amount, starting virtual balance, duration (from ten (10) minutes up to two (2) weeks), maximum participants, and public/private designation.</p>
              <p className="mb-2"><strong>6.2. Private Tournament Controls.</strong> Prior to the start time, private Tournament creators may (a) remove a registrant (entry fee auto-refunded), or (b) cancel the Tournament (all entry fees auto-refunded).</p>
              <p className="mb-2"><strong>6.3. Outcomes & Finality.</strong> At the end of a Tournament, winner(s) are determined by the highest final Virtual Portfolio value per Platform results. Our posted standings are authoritative. We may correct obvious errors or void/adjust results in the event of data or system errors materially affecting results.</p>
              <p className="mb-4"><strong>6.4. Fees & Payouts.</strong> For paid Tournaments, ninety-five percent (95%) of the entry fee pool is awarded to winner(s) per the posted structure; five percent (5%) is retained as the Platform fee.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">7. FUNDS: DEPOSITS, USES, WITHDRAWALS, CHARGEBACKS</h2>
              <p className="mb-2"><strong>7.1. Deposits & Uses.</strong> Deposits may be made via card (Stripe) or cryptocurrency. Funds in your Account may be used only for permitted Platform purposes (e.g., entry fees, tips) until eligible for withdrawal.</p>
              <p className="mb-2"><strong>7.2. Withdrawals.</strong> Payouts may be in cash or cryptocurrency, subject to applicable wager/playthrough requirements, fraud checks, and any verification we deem necessary. Network, gas, FX, and processor fees may apply.</p>
              <p className="mb-2"><strong>7.3. Tips.</strong> Users may tip other users where enabled. Tipping is a gratuitous transfer only; using tips to transfer value, circumvent limits, or as part of a bargained exchange is prohibited.</p>
              <p className="mb-2"><strong>7.4. Chargebacks & Fraud Holds.</strong> Suspicious activity, payment disputes, or chargebacks may result in holds, reversals, or account action. Where a chargeback occurs, associated entries/payouts may be voided; amounts may be deemed a debt owed to us until repaid.</p>
              <p className="mb-4"><strong>7.5. Taxes.</strong> Users are solely responsible for any taxes arising from winnings or payouts. We may require tax forms prior to payout.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">8. REFUNDS & CANCELLATIONS</h2>
              <p className="mb-2"><strong>8.1. Before Start.</strong> If a Tournament is canceled prior to its scheduled start by the creator or by us, entry fees are automatically refunded.</p>
              <p className="mb-4"><strong>8.2. After Start.</strong> After a Tournament has started, entry fees are generally non-refundable, except where we void a Tournament due to Platform/data failure or fraud.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">9. COMMUNITY & CHAT RULES</h2>
              <p className="mb-2"><strong>9.1. Conduct.</strong> Users must not engage in harassment, hate speech, doxxing, threats, obscene/NSFW content, spam, solicitation, or impersonation. We may remove content, limit chat, or suspend/terminate accounts for violations.</p>
              <p className="mb-2"><strong>9.2. Moderation & Records.</strong> We may monitor, log, and moderate chat to enforce this Agreement and the Policies. We may report unlawful content to appropriate authorities.</p>
              <p className="mb-4"><strong>9.3. No Endorsement.</strong> User opinions in chat or forums are those of the users and are not endorsed by Profolio.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">10. DATA, FEEDS, SERVICE INTERRUPTIONS; NO WARRANTIES</h2>
              <p className="mb-2"><strong>10.1. Market Data & Accuracy.</strong> Market data may be delayed, interrupted, or inaccurate; errors may affect gameplay or outcomes. We may void or adjust results for material data or system errors.</p>
              <p className="mb-2"><strong>10.2. Availability.</strong> Access to the Platform may be interrupted due to maintenance, outages, cyber incidents, third-party failures, or force majeure events. We do not warrant continuous, uninterrupted, or error-free service.</p>
              <p className="mb-4"><strong>10.3. Disclaimer.</strong> THE PLATFORM AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE." WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">11. INTELLECTUAL PROPERTY; USER CONTENT; DMCA</h2>
              <p className="mb-2"><strong>11.1. Ownership.</strong> The Platform, software, databases, designs, text, graphics, and trademarks are owned by ORSATH Holdings LLC or its licensors and are protected by IP laws.</p>
              <p className="mb-2"><strong>11.2. License to User Content.</strong> You retain ownership of your content but grant us a worldwide, non-exclusive, royalty-free, transferable license to host, use, reproduce, modify, display, and distribute your content as necessary to operate and promote the Services, including leaderboards and performance displays.</p>
              <p className="mb-2"><strong>11.3. Leaderboards & Publicity.</strong> You authorize us to display your username, avatar, tournament participation and results on the Platform, our social channels, and marketing. We will not sell non-public personal data.</p>
              <p className="mb-2"><strong>11.4. Restrictions.</strong> You may not copy, scrape, crawl, harvest, reverse engineer, or otherwise misuse the Platform or data.</p>
              <p className="mb-4"><strong>11.5. DMCA.</strong> If you believe material on the Platform infringes your copyright, send a notice under 17 U.S.C. §512 to counsel@orsath.com containing: (a) identification of the copyrighted work; (b) identification of the material and its location; (c) contact information; (d) a good-faith statement; (e) a statement under penalty of perjury; and (f) a signature (electronic or physical). We process valid takedowns and counter-notices.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">12. PROHIBITED USES; FRAUDULENT CONDUCT; AML</h2>
              <div className="mb-4">
                <p className="mb-2"><strong>12.1. Prohibited Uses.</strong> You shall not: (a) hack, probe, or disrupt the Platform; (b) attempt to bypass security; (c) introduce malware; (d) collude or coordinate outcomes; (e) use bots, scripts, or automation except where expressly authorized; (f) misuse tips or promotions; (g) scrape or harvest data; (h) impersonate others; or (i) violate law.</p>
                <p className="mb-2"><strong>12.2. Fraudulent Conduct.</strong> Fraudulent Conduct includes, without limitation, multi-accounting; payment fraud or chargeback abuse; identity misrepresentation; geolocation evasion (including VPN/proxy to circumvent restrictions); use of stolen or tainted cryptocurrency; manipulating portfolio values, data, or results; or any other deceptive or abusive practice.</p>
                <p className="mb-2"><strong>12.3. AML & KYC.</strong> We may conduct identity, sanctions, adverse media, and source-of-funds checks ourselves or via service providers. We may suspend or deactivate Accounts, void entries, or withhold payouts pending completion of reviews or where we suspect violation of AML, sanctions, or fraud laws.</p>
                <p className="mb-4"><strong>12.4. Remedies.</strong> We may freeze or close Accounts, void or reverse entries, reclaim or withhold payouts, offset amounts owed (including chargebacks and fees), and report activity to payment providers, crypto VASPs, law enforcement, or regulators.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">13. VERIFICATION; HOLDS; INVESTIGATIONS</h2>
              <p className="mb-2"><strong>13.1. Verification.</strong> We may request documents at any time (government ID; proof of address; payment proofs; wallet ownership proof). If you do not provide requested information in the required form within thirty (30) days, we may restrict or deactivate your Account and decline withdrawals.</p>
              <p className="mb-2"><strong>13.2. Holds.</strong> Payouts may be placed on hold pending fraud, AML, sanctions, or chargeback investigations.</p>
              <p className="mb-4"><strong>13.3. Cooperation.</strong> You agree to cooperate in good faith with any reasonable request related to compliance or investigations.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">14. PRIVACY</h2>
              <p className="mb-2"><strong>14.1. Data Collected.</strong> We collect name, email, IP address, phone number, region data, device and usage data, and other information described in the Privacy Policy.</p>
              <p className="mb-2"><strong>14.2. No Sale of Personal Data.</strong> We do not sell personal data. We use service providers (e.g., payments, market data) to operate the Services as described in our Privacy Policy.</p>
              <p className="mb-2"><strong>14.3. Minors.</strong> We do not knowingly collect personal information from children under 13. Student Accounts (13–17) are limited to free tournaments and may require parent/guardian consent where applicable.</p>
              <p className="mb-4"><strong>14.4. Privacy Policy Incorporated.</strong> The Privacy Policy is incorporated by reference into this Agreement.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">15. PROMOTIONS; AFFILIATES; CODES</h2>
              <p className="mb-2"><strong>15.1. Promotions.</strong> Promotions are subject to posted terms. We may modify or cancel promotions at any time. Abuse of any promotion may result in disqualification and account action.</p>
              <p className="mb-2"><strong>15.2. Affiliates & Invite Codes.</strong> We may offer affiliate rewards or invite codes (e.g., upon deposit). Abuse (including self-referral or circular transfers) is prohibited.</p>
              <p className="mb-4"><strong>15.3. Marketing Communications.</strong> We send marketing emails or notifications only if you opt in. You may opt out at any time.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">16. REFUSAL; SUSPENSION; TERMINATION</h2>
              <p className="mb-2"><strong>16.1. Our Rights.</strong> We may refuse to open an Account, limit functionality, suspend, or terminate your Account if we reasonably believe you violated this Agreement, engaged in Fraudulent Conduct, or pose regulatory/compliance risk.</p>
              <p className="mb-2"><strong>16.2. Notice & Appeal.</strong> Where feasible, we will provide notice and an appeal channel. Urgent safety, fraud, or legal cases may require immediate action without prior notice.</p>
              <p className="mb-4"><strong>16.3. Effect of Termination.</strong> Upon termination, your license to use the Services ends. Sections intended to survive (including §§10–23) shall survive.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">17. DISCLAIMERS</h2>
              <p className="mb-2"><strong>17.1. No Investment Services or Advice.</strong> We do not provide investment, legal, or tax advice. You are solely responsible for any decisions you make outside the Platform.</p>
              <p className="mb-4"><strong>17.2. Educational/Entertainment Only.</strong> The Services are for educational/entertainment purposes and are not designed for speculative or real-money trading.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">18. LIMITATION OF LIABILITY</h2>
              <p className="mb-2"><strong>18.1. Indirect Damages.</strong> TO THE FULLEST EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL.</p>
              <p className="mb-2"><strong>18.2. Liability Cap.</strong> OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICES SHALL NOT EXCEED THE GREATER OF (A) USD $100 OR (B) THE FEES YOU PAID TO US IN THE THIRTY (30) DAYS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.</p>
              <p className="mb-4"><strong>18.3. Exclusions.</strong> Some jurisdictions do not allow certain disclaimers or limitations; where prohibited, the limitation applies to the maximum extent permitted.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">19. INDEMNIFICATION</h2>
              <p className="mb-4"><strong>19.1.</strong> You shall defend, indemnify, and hold harmless ORSATH Holdings LLC, its affiliates, officers, directors, employees, and agents from and against all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) your use of the Services; (b) your content; (c) your violation of this Agreement or law; or (d) any Fraudulent Conduct.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">20. DISPUTE RESOLUTION; ARBITRATION; CLASS ACTION WAIVER</h2>
              <p className="mb-2"><strong>20.1. Governing Law.</strong> This Agreement is governed by the laws of the State of Delaware, without regard to conflict-of-laws principles.</p>
              <p className="mb-2"><strong>20.2. Binding Arbitration.</strong> Any dispute, claim, or controversy arising out of or relating to this Agreement or the Services shall be resolved by final and binding arbitration on an individual basis under the Federal Arbitration Act and the rules of JAMS (or AAA) before a single arbitrator. Hearings may be held remotely or in Delaware.</p>
              <p className="mb-2"><strong>20.3. Class/Collective Action Waiver.</strong> YOU AND WE WAIVE ANY RIGHT TO BRING CLAIMS AS A PLAINTIFF OR CLASS MEMBER IN A CLASS, COLLECTIVE, OR REPRESENTATIVE ACTION. THE ARBITRATOR MAY AWARD RELIEF ONLY IN FAVOR OF THE INDIVIDUAL PARTY SEEKING RELIEF.</p>
              <p className="mb-2"><strong>20.4. Small Claims & Injunctive Relief.</strong> Either party may seek relief in small-claims court or seek injunctive relief for IP or security issues.</p>
              <p className="mb-2"><strong>20.5. Opt-Out.</strong> You may opt out of arbitration within thirty (30) days of account creation by emailing counsel@orsath.com with the subject "Arbitration Opt-Out" and your account email.</p>
              <p className="mb-4"><strong>20.6. Confidentiality.</strong> Arbitration proceedings and awards are confidential except as required by law or to enforce the award.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">21. FORCE MAJEURE</h2>
              <p className="mb-4"><strong>21.1.</strong> We shall not be liable for any delay or failure to perform due to causes beyond our reasonable control, including acts of God, natural disasters, labor disputes, cyberattacks, widespread Internet or cloud outages, war, terrorism, civil unrest, governmental actions, or failures of third-party providers.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">22. ASSIGNMENT; BUSINESS TRANSFERS; NO AGENCY</h2>
              <p className="mb-2"><strong>22.1. Assignment.</strong> You may not assign or transfer this Agreement without our prior written consent. We may assign or transfer our rights and obligations, including in connection with a merger, acquisition, or sale of assets.</p>
              <p className="mb-2"><strong>22.2. Business Transfers.</strong> In the event of a change of control or sale of assets, Accounts and associated data may be transferred to the successor entity subject to this Agreement and applicable law.</p>
              <p className="mb-4"><strong>22.3. No Agency.</strong> Nothing herein creates any partnership, joint venture, fiduciary, or agency relationship between you and ORSATH Holdings LLC.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">23. MISCELLANEOUS</h2>
              <p className="mb-2"><strong>23.1. Severability.</strong> If any provision is held invalid or unenforceable, the remaining provisions remain in full force and effect; an invalid provision shall be modified to the minimum extent necessary to make it enforceable consistent with the parties' intent.</p>
              <p className="mb-2"><strong>23.2. Entire Agreement.</strong> This Agreement (and incorporated Policies) constitutes the entire agreement between you and us regarding the Services.</p>
              <p className="mb-2"><strong>23.3. No Waiver.</strong> No waiver of any term is deemed a further or continuing waiver of such term or any other term.</p>
              <p className="mb-2"><strong>23.4. Headings.</strong> Section headings are for convenience only and do not affect interpretation.</p>
              <p className="mb-4"><strong>23.5. Language.</strong> The English version of this Agreement controls.</p>
            </section>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="mb-2"><strong>Support:</strong> support@profolio.com</p>
              <p className="mb-2"><strong>Legal/DMCA/Arbitration Opt-Out:</strong> legal@orsath.com</p>
              <p className="mb-8"><strong>General Counsel:</strong> Daniel Palmer</p>

              <p className="mb-4">
                IN WITNESS WHEREOF, by using the Platform, you acknowledge that you have read, understood,
                and agree to be bound by this Agreement.
              </p>

              <p className="font-bold">
                ORSATH HOLDINGS LLC d/b/a Profolio
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
