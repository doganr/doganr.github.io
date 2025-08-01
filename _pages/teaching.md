---
layout: page
title: teaching
permalink: /teaching/
description: Materials and Course Details.
nav: true
nav_order: 6
display_categories: [spring, fall]
horizontal: false
---

## Teaching

<div class="teaching">
{% if site.enable_teaching_categories and page.display_categories %}
  <!-- Display categorized teaching items -->
  {% for category in page.display_categories %}
  <a id="{{ category }}" href=".#{{ category }}">
    <h2 class="category text-capitalize">{{ category }}</h2>
  </a>
  {% assign categorized_courses = site.teaching | where: "category", category %}
  {% assign sorted_courses = categorized_courses | sort: "importance" %}
  <!-- Generate cards for each course -->
  {% if page.horizontal %}
  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
    {% for course in sorted_courses %}
      {% include teaching_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for course in sorted_courses %}
      {% include teaching.liquid %}
    {% endfor %}
  </div>
  {% endif %}
  {% endfor %}
{% else %}
<!-- Display courses without categories -->
{% assign sorted_courses = site.teaching | sort: "importance" %}
  {% if page.horizontal %}
  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
    {% for course in sorted_courses %}
      {% include teaching_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for course in sorted_courses %}
      {% include teaching.liquid %}
    {% endfor %}
  </div>
  {% endif %}
{% endif %}
</div>