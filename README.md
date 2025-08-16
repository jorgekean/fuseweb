# Git Flow for Controlled Production Deployments

This document outlines the Git branching and CI/CD workflow for our project in Azure DevOps, specifically designed to ensure that deployments to the Production (PROD) environment are controlled, traceable, and based on explicitly approved user stories and bug fixes. This also ensures that all codes that will merge on the main(QA) branch are reviewed.

---

## 1. Core Principles

* **Controlled PROD Releases:** Only code associated with approved user stories and bug fixes makes it to production.

* **Traceability:** Every change deployed to PROD is directly linked to specific work items (User Stories, Bugs) in Azure Boards.

* **Quality Gates:** Automated checks and mandatory code reviews ensure code quality at every integration point.

* **Automation:** Once changes are approved and merged into the designated PROD branch, deployment is automated.

---

## 2. Branching Strategy

Our strategy employs two primary long-lived branches and short-lived feature/bugfix branches:

* **`main` (or `develop`)**:

    * **Purpose:** This is our primary development and integration branch. All new features and bug fixes are initially merged here.

    * **CI/CD:** Our continuous integration (CI) pipeline is triggered on every merge to this branch, running builds, tests, and deploying to non-production environments (e.g., Dev, QA, Staging).

    * **State:** Should always be stable and ready for internal testing.

* **`production`**:

    * **Purpose:** This branch represents the codebase currently running in the Production environment. It is the *sole source* for PROD deployments.

    * **CI/CD:** A dedicated PROD deployment pipeline is triggered *only* when changes are merged into this branch.

    * **State:** Must always be production-ready and reflect what's live.

* **Feature/Bugfix Branches (Short-Lived)**:

    * **Naming Convention:**

        * `feature/<description>` (e.g., `feature/new-dashboard-ui`)

        * `bugfix/<description>` (e.g., `bugfix/login-page-error`)

        * `bugfix/WI-<WorkItemID>-<description>` (e.g., `bugfix/WI-1234-login-error`)

    * **Purpose:** Created from `main` (or `develop`) for individual user stories or bug fixes.

    * **Lifecycle:** Deleted after successfully merging their changes into `main` (and subsequently into `production` via a release PR).

---

## 3. Workflow Steps: From Idea to Production

### Step 1: Feature/Bugfix Development

1.  **Create Work Item:** A User Story or Bug work item is created in Azure Boards to track the work.

2.  **Create Branch:** A developer creates a new feature or bugfix branch from the `main` (or `develop`) branch.

    * **Local:** `git checkout main` then `git checkout -b feature/my-new-feature`

3.  **Code & Commit:** Developer implements the changes and commits them regularly to their feature branch.

4.  **Push to Remote:** Developer pushes the feature branch to Azure Repos.

    * **Local:** `git push origin feature/my-new-feature`

### Step 2: Initial Integration & Testing (Pull Request to `main`)

1.  **Create Pull Request (PR):**

    * The developer creates a PR in Azure DevOps.

    * **Source Branch:** `feature/my-new-feature`

    * **Target Branch:** `main` (or `develop`)

    * **Link Work Item(s):** **Crucially, link the relevant User Story or Bug work item(s)** to this PR.

    * Provide a clear title and description.

2.  **Automated Validation:**

    * The CI pipeline (defined in `pipelines.yaml` for `main` branch) automatically runs against the PR's changes. This includes building, running unit tests, and static analysis.

    * Reviewers are automatically notified.

3.  **Code Review:** Team members review the code, provide feedback, and request changes.

4.  **Address Feedback:** Developer updates their feature branch based on feedback, pushing new commits to the PR. Automated checks rerun.

5.  **Merge to `main`:** Once reviews are approved and all policies pass, the PR is merged into `main`. The feature branch is typically deleted.

6.  **CI/CD to Dev/QA:** The merge to `main` triggers the CI pipeline, deploying the latest changes to your development and/or QA environments for further testing (e.g., UAT).

### Step 3: Preparing for a PROD Release (The Gated Merge)

This is the core of our controlled PROD deployment. This step is typically performed by a Release Manager or Lead.

1.  **Identify Release Scope:** Determine which User Stories and Bug Fixes (that have been successfully merged into `main` and tested in lower environments) are ready for Production.

2.  **Create PROD Release Pull Request (PR):**

    * Go to **Repos > Pull requests** in Azure DevOps and click **New pull request**.

    * **Source Branch:** `main` (or `develop`)

    * **Target Branch:** `production`

    * **Link Work Item(s):** **This is critical! Explicitly link ALL User Stories and Bug work items** that are part of this specific PROD release. The `production` branch policies will enforce this.

    * **Title & Description:** Provide a clear title (e.g., "PROD Release v1.2 - New Dashboard & Login Fix") and a summary of the included features/fixes.

3.  **PROD Release PR Validation:**

    * **Branch Policies on `production`** will activate:

        * **Minimum Reviewers:** Ensures multiple eyes on the PROD release.

        * **Linked Work Items:** Guarantees traceability for every change going to PROD.

        * **Build Validation:** Runs the PROD deployment pipeline's build stage to confirm the code is ready for PROD.

        * **Resolve Comments:** Ensures all discussions are closed.

    * Reviewers (including designated PROD approvers) meticulously review the PR, focusing on the linked work items and the overall readiness for production.

### Step 4: Automated PROD Deployment

1.  **Merge to `production`:** Once all `production` branch policies are met and approvals are granted, the PROD release PR is merged into the `production` branch.

2.  **PROD Deployment Pipeline Trigger:** This merge event automatically triggers the dedicated PROD deployment pipeline (as configured in `pipelines.yaml` with the `production` branch trigger).

3.  **Environment Approvals (Optional):** If configured, the PROD deployment pipeline will pause and await final manual approval(s) from designated individuals in the Azure DevOps Environment.

4.  **Deployment:** Upon approval, the pipeline deploys the application to the Production environment.

5.  **Branch Cleanup:** The source branch of the PROD release PR (which was `main` or `develop` in this case) is *not* deleted. Only the short-lived feature/bugfix branches are deleted after their initial merge to `main`.

---

## 4. Key Azure DevOps Configurations

To implement this flow, ensure the following are configured:

* **Azure Repos Branch Policies on `production` branch:**

    * **Require a minimum number of reviewers:** (e.g., 2, disallow self-approval).

    * **Check for linked work items:** `On` (with minimum 1 linked item).

    * **Build validation:** Point to your main build pipeline, `Required`, `Automatic`, `Immediately when production branch is updated`.

    * **Require a successful merge:** `On`.

    * **Resolve comments:** `On`.

    * **Limit merge types:** Consider `Squash merge` or `No fast-forward merge`.

* **`pipelines.yaml` for PROD Deployment:**

    * Set the `trigger` to `branches: include: - production`.

    * Ensure your pipeline downloads artifacts from the correct build (either from a prior stage in the same pipeline or from a separate build pipeline that builds the `production` branch).

* **Azure DevOps Environment for `Prod` (Pipelines > Environments):**

    * Configure **Approvals and checks** on the `Prod` environment to add a final manual gate before deployment.

This Git flow provides a robust framework for managing your codebase, ensuring quality, and maintaining strict control over what gets deployed to your production environment, all while keeping your user stories at the center of your release process.