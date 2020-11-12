FROM debian:stable-slim
LABEL maintainer="Chris Blum <cblum@redhat.com>"

RUN apt update && \
    apt install -y git wget curl python3-pip rubygems

WORKDIR /workdir
RUN pip3 install pre-commit
COPY .pre-commit-config.yaml .
COPY .eslintrc.yml .
RUN git init
RUN npm install -g @typescript-eslint/eslint-plugin@latest
# RUN gem install --no-document mdl
RUN pre-commit install-hooks
ENV CLOUDSDK_CORE_DISABLE_PROMPTS=1
RUN curl https://sdk.cloud.google.com | bash
