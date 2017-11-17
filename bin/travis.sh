#!/bin/bash
# Based on https://github.com/jonatanklosko/wca_statistics/blob/master/bin/travis.sh

changed_statistic_files=`git diff --name-only $TRAVIS_COMMIT_RANGE | grep 'statistics/' | grep -v 'statistics/home.js'`

# if [[ "$TRAVIS_EVENT_TYPE" != "cron" && "$changed_statistic_files" == "" ]]; then
#   echo "There is nothing to compute."
# else
  # Set up database.
  bin/init.js
  bin/update_database.rb
  # When a cron job compute all statistics, otherwise just the updated and new ones.
  if [[ "$TRAVIS_EVENT_TYPE" == "cron" ]]; then
    bin/compute.js statistcs/*
  else
    # Copy existing files from gh-pages to the build directory.
    git checkout gh-pages .
    mv `git ls-tree --name-only gh-pages | grep '.md'` build
    echo "$changed_statistic_files" | while read line; do
      echo "File has changed: $line"
      bin/compute.js $line
    done
  fi

  # Update the home file in both cases.
  #bin/compute_home.js
# fi
