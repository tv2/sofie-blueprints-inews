#!/bin/sh

echo "Upload Shelf Layouts"

upload_layouts_from_directory() {
  local directory="$1"
  local blueprint_id=$(basename "${directory}")
  local count=0

  for file in "$directory"/*.json; do
    if [[ -f "$file" ]]; then
      count+=1
      url="${SERVER}/shelfLayouts/uploadByShowStyleBlueprintId/${blueprint_id}"
      echo "Upload ${file} to blueprint ${blueprint_id}"
      target_path="$(readlink -f "$file")"
      curl -X POST --data-binary "@$target_path" --header "Content-Type:application/json" -w "\n" "$url"
    fi
  done
}

for directory in *; do
  if [[ -d "$directory" ]]; then
    upload_layouts_from_directory "$directory"
  fi
done
