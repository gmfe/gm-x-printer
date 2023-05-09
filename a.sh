if [[ refs/tags/v1.8.7-beta.6 == *refs/tags/*-beta* ]]; then
    echo "1"
  elif [[ refs/tags/v1.8.7-beta.6 == *refs/tags/*-alpha* ]]; then
    echo "2"
  else
    echo "3"
  fi