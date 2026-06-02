terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  cloud {
    hostname     = "app.terraform.io"
    organization = "homelab_hudater"
    workspaces {
      name = "assets-pipeline"
    }
  }
}

provider "cloudflare" {
  api_token = var.cf_edit_all_api_token
}

resource "cloudflare_workers_kv_namespace" "resume" {
  account_id = var.cloudflare_account_id
  title      = "resume-kv"
}

resource "cloudflare_worker_script" "resume" {
  account_id = var.cloudflare_account_id
  name       = "resume-worker"
  content    = file("${path.module}/../worker/index.js")
  module     = true

  kv_namespace_binding {
    name         = "RESUME_KV"
    namespace_id = cloudflare_workers_kv_namespace.resume.id
  }
}

resource "cloudflare_worker_domain" "resume" {
  account_id = var.cloudflare_account_id
  hostname   = "resume.hudater.dev"
  service    = cloudflare_worker_script.resume.name
  zone_id    = var.zone_id_hudater_dev
}

resource "cloudflare_worker_domain" "showcase" {
  account_id = var.cloudflare_account_id
  hostname   = "showcase.hudater.dev"
  service    = cloudflare_worker_script.resume.name
  zone_id    = var.zone_id_hudater_dev
}
