{{/*
Expand the name of the chart.
*/}}
{{- define "nextjs-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "nextjs-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "nextjs-app.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "nextjs-app.labels" -}}
helm.sh/chart: {{ include "nextjs-app.chart" . }}
{{ include "nextjs-app.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- with .Values.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "nextjs-app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "nextjs-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "nextjs-app.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "nextjs-app.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Validate image tag format - must contain commit SHA
*/}}
{{- define "nextjs-app.validateImageTag" -}}
{{- $tag := .Values.image.tag | default .Chart.AppVersion -}}
{{- if not (regexMatch "^.+-[0-9a-f]{40}$" $tag) -}}
{{- fail (printf "Invalid image tag format: '%s'. Expected format: {branch}-{40-char-commit-sha} (e.g., main-592c810961d06c9969c8504263e1ffb0b964685e)" $tag) -}}
{{- end -}}
{{- end -}}
