
export interface JobPosition {
  id: string;
  name: string;
  category: string;
  education: string;
}

export interface PosterData {
  id: string;
  companyName: string;
  introduction: string;
  jobs: JobPosition[];
  address: string;
  email: string;
  headerImage?: string;
  backgroundImage?: string;
}

export const INITIAL_DATA: PosterData = {
  id: '1',
  companyName: '中煤科工集团上海研究院有限公司常熟分院',
  introduction: '分院以天地科技股份有限公司上海分公司从事电气研发的主力人员组建，是中煤科工集团上海研究院有限公司（以下简称上海院）在常熟的分支机构，隶属于中煤科工集团上海有限公司，为国务院国资委直属央企，是以煤炭装备行业电气技术为主，适度多元化的研发型企业。分院是上海院的人才储备中心，为上海院输送优秀人才。分院致力于煤炭行业智能化、无人化开采的核心技术研发推广，一直引领国内煤装装备事业的进步与发展。',
  jobs: [
    {
      id: 'j1',
      name: '电气工程师',
      category: '电子信息类',
      education: '本科'
    },
    {
      id: 'j2',
      name: '结构工程师',
      category: '机械类',
      education: '硕士'
    },
    {
      id: 'j3',
      name: '电气工程师',
      category: '电子信息类',
      education: '本科'
    },
    {
      id: 'j4',
      name: '结构工程师',
      category: '机械类',
      education: '硕士'
    }
  ],
  address: '嘉兴路18号301',
  email: 'csfy@mksh.com.cn'
};