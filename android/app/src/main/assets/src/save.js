// SaveLoadAdapter.js

export class SaveLoadAdapter {
  constructor() {
    this.storageKeys = {
      charts: 'tvCharts',
      autoSaveChart: 'tvAutoSaveChart', // Add this line
      studyTemplates: 'tvStudyTemplates',
      drawingTemplates: 'tvDrawingTemplates',
      chartTemplates: 'tvChartTemplates',
      drawings: 'tvDrawings'
    };
    this.loadFromLocalStorage();
  }

  loadFromLocalStorage() {
    this.charts = JSON.parse(localStorage.getItem(this.storageKeys.charts) || '[]');
    this.studyTemplates = JSON.parse(localStorage.getItem(this.storageKeys.studyTemplates) || '[]');
    this.drawingTemplates = JSON.parse(localStorage.getItem(this.storageKeys.drawingTemplates) || '[]');
    this.chartTemplates = JSON.parse(localStorage.getItem(this.storageKeys.chartTemplates) || '[]');
    this.drawings = JSON.parse(localStorage.getItem(this.storageKeys.drawings) || '{}');
  }

  saveToLocalStorage(key) {
    localStorage.setItem(this.storageKeys[key], JSON.stringify(this[key]));
  }

  getAllCharts() {
    return Promise.resolve(this.charts);
  }

  removeChart(id) {
    this.charts = this.charts.filter(chart => chart.id !== id);
    this.saveToLocalStorage('charts');
    return Promise.resolve();
  }

  saveChart(chartData) {
    if (!chartData.id) {
      chartData.id = Math.random().toString();
    } else {
      this.removeChart(chartData.id);
    }
    
    const savedChartData = {
      ...chartData,
      id: chartData.id,
      timestamp: Math.round(Date.now() / 1000),
    };

    this.charts.push(savedChartData);
    this.saveToLocalStorage('charts');
    return Promise.resolve(chartData.id);
  }

  getChartContent(id) {
    const chart = this.charts.find(chart => chart.id === id);
    return chart ? Promise.resolve(chart.content) : Promise.reject(new Error("Chart not found"));
  }

  getAllStudyTemplates() {
    return Promise.resolve(this.studyTemplates);
  }

  removeStudyTemplate(studyTemplateInfo) {
    this.studyTemplates = this.studyTemplates.filter(template => template.name !== studyTemplateInfo.name);
    this.saveToLocalStorage('studyTemplates');
    return Promise.resolve();
  }

  saveStudyTemplate(studyTemplateData) {
    const index = this.studyTemplates.findIndex(template => template.name === studyTemplateData.name);
    if (index !== -1) {
      this.studyTemplates[index] = studyTemplateData;
    } else {
      this.studyTemplates.push(studyTemplateData);
    }
    this.saveToLocalStorage('studyTemplates');
    return Promise.resolve();
  }

  getStudyTemplateContent(studyTemplateInfo) {
    const template = this.studyTemplates.find(template => template.name === studyTemplateInfo.name);
    return template ? Promise.resolve(template.content) : Promise.reject(new Error("Study template not found"));
  }

  getDrawingTemplates(toolName) {
    return Promise.resolve(this.drawingTemplates.filter(template => template.toolName === toolName).map(template => template.name));
  }

  loadDrawingTemplate(toolName, templateName) {
    const template = this.drawingTemplates.find(template => template.toolName === toolName && template.name === templateName);
    return template ? Promise.resolve(template.content) : Promise.reject(new Error("Drawing template not found"));
  }

  removeDrawingTemplate(toolName, templateName) {
    this.drawingTemplates = this.drawingTemplates.filter(template => !(template.toolName === toolName && template.name === templateName));
    this.saveToLocalStorage('drawingTemplates');
    return Promise.resolve();
  }

  saveDrawingTemplate(toolName, templateName, content) {
    const index = this.drawingTemplates.findIndex(template => template.toolName === toolName && template.name === templateName);
    if (index !== -1) {
      this.drawingTemplates[index] = { toolName, name: templateName, content };
    } else {
      this.drawingTemplates.push({ toolName, name: templateName, content });
    }
    this.saveToLocalStorage('drawingTemplates');
    return Promise.resolve();
  }

  getAllChartTemplates() {
    return Promise.resolve(this.chartTemplates.map(template => template.name));
  }

  saveChartTemplate(templateName, content) {
    const index = this.chartTemplates.findIndex(template => template.name === templateName);
    if (index !== -1) {
      this.chartTemplates[index].content = content;
    } else {
      this.chartTemplates.push({ name: templateName, content });
    }
    this.saveToLocalStorage('chartTemplates');
    return Promise.resolve();
  }

  getChartTemplateContent(templateName) {
    const template = this.chartTemplates.find(template => template.name === templateName);
    return template ? Promise.resolve({ content: JSON.parse(JSON.stringify(template.content)) }) : Promise.reject(new Error("Chart template not found"));
  }

  saveLineToolsAndGroups(layoutId, chartId, state) {
    const drawings = state.sources;
    if (!this.drawings[`${layoutId}/${chartId}`]) {
      this.drawings[`${layoutId}/${chartId}`] = {};
    }
    for (let [key, state] of drawings) {
      if (state === null) {
        delete this.drawings[`${layoutId}/${chartId}`][key];
      } else {
        this.drawings[`${layoutId}/${chartId}`][key] = state;
      }
    }
    this.saveToLocalStorage('drawings');
    return Promise.resolve();
  }

  loadLineToolsAndGroups(layoutId, chartId, requestType, requestContext) {
    const rawSources = this.drawings[`${layoutId}/${chartId}`];
    if (!rawSources) return Promise.resolve(null);
    const sources = new Map();
    for (let [key, state] of Object.entries(rawSources)) {
      sources.set(key, state);
    }
    return Promise.resolve({ sources });
  }
  saveAutoSaveChart(chartData) {
    localStorage.setItem(this.storageKeys.autoSaveChart, JSON.stringify(chartData));
    return Promise.resolve();
  }

  loadAutoSaveChart() {
    const chartData = JSON.parse(localStorage.getItem(this.storageKeys.autoSaveChart));
    return chartData ? Promise.resolve(chartData) : Promise.reject(new Error("No auto-save found"));
  }

  removeAutoSaveChart() {
    localStorage.removeItem(this.storageKeys.autoSaveChart);
    return Promise.resolve();
  }
}