#!/usr/bin/env bash

rm -rf brisk

git clone https://github.com/AceMood/brisk.git

rm -rf third_party
if [ ! -d "third_party" ]; then
  mkdir third_party
fi

mv brisk/* third_party/

rm -rf brisk